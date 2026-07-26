from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Tuple, List, TypeVar, Any

T = TypeVar('T')

async def paginate(session: AsyncSession, query: Any, page: int, page_size: int) -> Tuple[List[T], int]:
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)
    
    # Get items
    paginated_query = query.offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(paginated_query)
    items = result.scalars().all()
    
    return items, total or 0
