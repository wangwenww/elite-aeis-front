"""
生产环境配置（云托管）
从环境变量读取
"""
import os

DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

MYSQL_USERNAME = os.environ.get("MYSQL_USERNAME", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_ADDRESS = os.environ.get("MYSQL_ADDRESS", "127.0.0.1:3306")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "aeis_question_bank")

API_HOST = os.environ.get("API_HOST", "0.0.0.0")
API_PORT = int(os.environ.get("API_PORT", "5000"))

CORS_ORIGINS = (
    [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
    if os.environ.get("CORS_ORIGINS")
    else []
)

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

