from secretswap import database

if __name__ == "__main__":
    print("Initializing SecretSwap database...")
    database.init_db()
    print(f"Database initialized at {database.config.DATABASE_PATH}")
