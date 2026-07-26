
import psycopg
conn = psycopg.connect('postgresql://postgres:postgres@localhost:5432/postgres', autocommit=True)
cur = conn.cursor()
cur.execute('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ''iedc_test''')
cur.execute('DROP DATABASE IF EXISTS iedc_test')
cur.execute('CREATE DATABASE iedc_test')
conn.close()

