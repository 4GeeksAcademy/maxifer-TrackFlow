"""Chrome/CDP smoke against a local production backoffice, with synthetic fetches.

Usage: uv run --frozen python -m scripts.check_caching_browser [--baseline]
Requires Chrome and an already running backoffice at localhost:3101.
"""
import argparse
import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import time
from urllib.request import urlopen

from websockets.sync.client import connect


def run(baseline=False, port=3101):
    chrome = Path("C:/Program Files/Google/Chrome/Application/chrome.exe")
    with TemporaryDirectory(prefix="trackflow-browser-") as profile:
        process = subprocess.Popen([str(chrome), "--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", f"--user-data-dir={profile}", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=0x08000000)
        try:
            for _ in range(100):
                try:
                    debug_port = (Path(profile) / "DevToolsActivePort").read_text().splitlines()[0]
                    tabs = json.load(urlopen(f"http://localhost:{debug_port}/json"))
                    break
                except OSError:
                    time.sleep(.1)
            with connect(tabs[0]["webSocketDebuggerUrl"], max_size=10000000) as socket:
                count = 0
                def call(method, params=None):
                    nonlocal count
                    count += 1
                    socket.send(json.dumps(dict(id=count, method=method, params=params or {})))
                    while True:
                        result = json.loads(socket.recv())
                        if result.get("id") == count:
                            assert "error" not in result, result
                            return result.get("result", {})
                def js(expression):
                    result = call("Runtime.evaluate", dict(expression=expression, returnByValue=True, awaitPromise=True))
                    assert "exceptionDetails" not in result, result
                    return result.get("result", {}).get("value")
                def wait(expression):
                    for _ in range(150):
                        if js(expression):
                            return
                        time.sleep(.1)
                    raise AssertionError((expression, js("({url:location.href,token:localStorage.getItem('trackflow_auth_token'),body:document.body.innerText.slice(0,500)})")))
                call("Page.enable")
                call("Network.enable")
                call("Network.setCacheDisabled", {"cacheDisabled": True})
                call("Page.addScriptToEvaluateOnNewDocument", {"source": """
                    localStorage.setItem('trackflow_auth_token','synthetic-browser-token');
                    const realFetch = window.fetch.bind(window);
                    window.fetch = async (url, init) => {
                      if (!String(url).startsWith('/backend/')) return realFetch(url,init);
                      let data = [];
                      if (String(url).includes('/summary')) data = {total:0,by_status:{},by_category:{},by_origin:{},by_branch:{}};
                      if (String(url).includes('/auth/me')) data = {user:{id:'synthetic',email:'browser@example.com'},profile:{name:'Synthetic'}};
                      return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
                    };
                """})
                for route, title in (("incidents", "Registro r\u00e1pido de incidencia"), ("suppliers", "Registrar proveedor")):
                    call("Page.navigate", {"url": f"http://localhost:{port}/login"})
                    wait("location.pathname === '/' && document.querySelector('h1')?.textContent === 'Backoffice operativo'")
                    js(f"document.querySelector('a[href=\"/{route}\"]').click()")
                    wait(f"document.querySelector('button#new-{'incident' if route == 'incidents' else 'supplier'}') !== null")
                    time.sleep(.5)
                    wait(f"document.querySelector('button#new-{'incident' if route == 'incidents' else 'supplier'}') !== null")
                    resources = "performance.getEntriesByType('resource').filter(x=>x.name.includes('/_next/') && x.name.includes('.js')).map(x=>({name:x.name.split('/').pop(),bytes:x.decodedBodySize}))"
                    before = js(resources)
                    js(f"document.querySelector('button#new-{'incident' if route == 'incidents' else 'supplier'}').click()")
                    wait("!!document.querySelector('dialog[open]')")
                    assert js("document.querySelector('dialog[open]').contains(document.activeElement)"), "focus not inside modal"
                    after = js(resources)
                    print(json.dumps(dict(route=route, initial_js_bytes=sum(x['bytes'] for x in before), deferred_js_bytes=sum(x['bytes'] for x in after if x['name'] not in {r['name'] for r in before}), initial_chunks=[x['name'] for x in before])), flush=True)
                    if not baseline:
                        assert len(after) > len(before), "form chunk downloaded before opening"
                    call("Input.dispatchKeyEvent", {"type":"keyDown", "key":"Escape", "code":"Escape", "windowsVirtualKeyCode":27})
                    call("Input.dispatchKeyEvent", {"type":"keyUp", "key":"Escape", "code":"Escape", "windowsVirtualKeyCode":27})
                    wait("!document.querySelector('dialog[open]')")
                    js(f"location.hash = 'new-{'incident' if route == 'incidents' else 'supplier'}'")
                    wait("!!document.querySelector('dialog[open]')")
        finally:
            process.terminate()
            process.wait(timeout=15)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", action="store_true")
    parser.add_argument("--port", type=int, default=3101)
    args = parser.parse_args()
    run(args.baseline, args.port)
