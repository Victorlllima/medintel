"""
Configuração do Celery para processamento assíncrono
"""
from celery import Celery
from app.core.config import settings

# Criar instância do Celery
celery_app = Celery(
    "medintel",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

# Configurações do Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutos
    task_soft_time_limit=25 * 60,  # 25 minutos
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # 1 hora
    broker_connection_retry_on_startup=True,
)

# Configuração de retry para conexão com o broker
celery_app.conf.broker_transport_options = {
    'visibility_timeout': 3600,  # 1 hora
    'max_retries': 3,
    'interval_start': 0,
    'interval_step': 0.2,
    'interval_max': 0.5,
}

if __name__ == "__main__":
    celery_app.start()
