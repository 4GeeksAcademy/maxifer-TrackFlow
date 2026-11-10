"""Bounded, user-scoped TTL cache for incident read models, per API process."""
from collections import OrderedDict
from copy import deepcopy
from threading import RLock
from time import monotonic


class IncidentCache:
    def __init__(self, ttl=30, max_entries=128, clock=monotonic):
        self.ttl = ttl
        self.max_entries = max_entries
        self.clock = clock
        self._entries = OrderedDict()
        self._lock = RLock()

    def get_or_load(self, key, load):
        # The same lock guards committed writes and reads. An in-flight read
        # cannot publish an old value after a write has committed and invalidated.
        with self._lock:
            now = self.clock()
            for expired in [key for key, (deadline, _) in self._entries.items() if deadline <= now]:
                del self._entries[expired]
            if key in self._entries:
                self._entries.move_to_end(key)
                return deepcopy(self._entries[key][1])
            value = load()  # Exceptions are never stored.
            self._entries[key] = (self.clock() + self.ttl, deepcopy(value))
            if len(self._entries) > self.max_entries:
                self._entries.popitem(last=False)
            return value

    def clear(self):
        with self._lock:
            self._entries.clear()

    @property
    def write_lock(self):
        return self._lock


incident_cache = IncidentCache()
