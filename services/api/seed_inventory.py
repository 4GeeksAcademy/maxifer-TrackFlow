from sqlmodel import Session, select

from services.api.database import create_inventory_tables, get_users_table, inventory_engine
from services.api.inventory_models import SKU, StockEntry, StockExit


SKUS = [
	("Zapatilla blanca clásica - Talla 42", "CLT-SNK-W-42", "PureStep Footwear", "fashion", "LA"),
	("Zapatilla blanca clásica - Talla 42", "CLT-SNK-W-42-Z", "PureStep Footwear", "fashion", "ZGZ"),
	("Auriculares inalámbricos Pro", "TEC-EAR-001", "SoundWave Electronics", "electronics", "LA"),
	("Sérum facial hidratante 30ml", "CSM-SRM-030", "GlowLab Cosmetics", "cosmetics", "ZGZ"),
	("Chino slim fit - marino 32/32", "CLT-CHN-N-32", "UrbanThread", "fashion", "LA"),
	("Cargador rápido USB-C 65W", "TEC-CHG-065", "SoundWave Electronics", "electronics", "ZGZ"),
]

ENTRIES = [
	("CLT-SNK-W-42", 80, "PO-2024-0098", "LA"),
	("CLT-SNK-W-42", 45, "GR-LA-0234", "LA"),
	("TEC-EAR-001", 40, "PO-2024-0102", "LA"),
	("CSM-SRM-030", 30, "GR-ZGZ-0187", "ZGZ"),
]

EXITS = [
	("CLT-SNK-W-42", 12, "dispatch", "1Z999AA10123456784", "LA"),
	("CLT-SNK-W-42", 2, "loss", None, "LA"),
	("CSM-SRM-030", 5, "dispatch", "MRW-2024-77812", "ZGZ"),
]


def main() -> None:
	create_inventory_tables()
	users = get_users_table().all()
	if not users:
		raise RuntimeError("Crea primero un usuario en TinyDB para atribuir los movimientos semilla.")
	user_uuid = str(users[0]["id"])

	if inventory_engine is None:
		raise RuntimeError("DATABASE_URL no está configurada")

	with Session(inventory_engine) as session:
		products_by_sku = {}
		for name, sku, client_name, category, warehouse in SKUS:
			product = session.exec(select(SKU).where(SKU.sku == sku)).first()
			if product is None:
				product = SKU(
					name=name,
					sku=sku,
					client_name=client_name,
					category=category,
					warehouse=warehouse,
				)
				session.add(product)
				session.flush()
			products_by_sku[sku] = product

		for sku, quantity, reference, warehouse in ENTRIES:
			exists = session.exec(
				select(StockEntry).where(StockEntry.reference == reference)
			).first()
			if exists is None:
				session.add(StockEntry(
					sku_id=products_by_sku[sku].id,
					quantity=quantity,
					reference=reference,
					warehouse=warehouse,
					user_uuid=user_uuid,
				))

		for sku, quantity, exit_type, tracking_number, warehouse in EXITS:
			exists = session.exec(
				select(StockExit).where(StockExit.tracking_number == tracking_number)
				if tracking_number is not None
				else select(StockExit).where(
					StockExit.sku_id == products_by_sku[sku].id,
					StockExit.exit_type == exit_type,
					StockExit.quantity == quantity,
					StockExit.warehouse == warehouse,
				)
			).first()
			if exists is None:
				session.add(StockExit(
					sku_id=products_by_sku[sku].id,
					quantity=quantity,
					exit_type=exit_type,
					tracking_number=tracking_number,
					warehouse=warehouse,
					user_uuid=user_uuid,
				))

		session.commit()
		print("Datos semilla de inventario cargados (o ya existentes).")


if __name__ == "__main__":
	main()