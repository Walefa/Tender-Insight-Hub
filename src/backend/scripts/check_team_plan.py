import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sql_models import User, Team
from sqlalchemy.future import select

def check_team_plan(email: str):
    async def main():
        async for db in get_db():
            result = await db.execute(
                select(User, Team).join(Team, User.team_id == Team.id).where(User.email == email)
            )
            user_with_team = result.first()
            if user_with_team:
                user, team = user_with_team
                print(f"User: {user.email}, Team Plan: {team.plan}")
            else:
                print("User not found or no associated team.")

    asyncio.run(main())

if __name__ == "__main__":
    email = input("Enter user email: ")
    check_team_plan(email)