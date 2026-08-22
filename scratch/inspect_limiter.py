from slowapi import Limiter
from slowapi.util import get_remote_address

import inspect
print(inspect.signature(Limiter.__init__))
