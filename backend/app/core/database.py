"""
Configuração do banco de dados
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.consultation import Base

# Criar engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Criar todas as tabelas no banco de dados"""
    Base.metadata.create_all(bind=engine)
    print("✓ Tabelas criadas com sucesso!")


def drop_tables():
    """Deletar todas as tabelas do banco de dados"""
    Base.metadata.drop_all(bind=engine)
    print("✓ Tabelas deletadas!")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "drop":
        drop_tables()
    else:
        create_tables()
