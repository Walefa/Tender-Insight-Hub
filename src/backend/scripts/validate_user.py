import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.models.sql_models import User
from app.core.security import verify_password

# Database connection URL (update with your database credentials)
DATABASE_URL = "postgresql+asyncpg://username:password@localhost/db_name"

# Create async engine and session
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def validate_user(email: str, plain_password: str):
    async with async_session() as session:
        # Query the user by email
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            print("User not found.")
            return

        print(f"User found: {user.email}")
        print(f"Hashed password: {user.hashed_password}")

        # Validate the password
        if verify_password(plain_password, user.hashed_password):
            print("Password is valid.")
        else:
            print("Invalid password.")


if __name__ == "__main__":
    email = input("Enter user email: ")
    plain_password = input("Enter plain password: ")
    asyncio.run(validate_user(email, plain_password))