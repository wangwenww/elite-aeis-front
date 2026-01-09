"""
本地开发配置
"""

# Debug 开关
DEBUG = True

# MySQL 本地配置
MYSQL_USERNAME = "root"
MYSQL_PASSWORD = "123456"
MYSQL_HOST = "127.0.0.1"
MYSQL_PORT = "3306"
MYSQL_DATABASE = "aeis_question_bank"

# 兼容旧变量名
MYSQL_ADDRESS = f"{MYSQL_HOST}:{MYSQL_PORT}"

# 服务监听
API_HOST = "0.0.0.0"
API_PORT = 5000

# CORS
CORS_ORIGINS = ["*"]

# 日志
LOG_LEVEL = "DEBUG"

