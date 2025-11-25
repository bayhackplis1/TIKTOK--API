# 🔥 Comandos para Agregar Chat Global a tu Deployment Existente

Ya tienes tu script de deployment. Estos son los comandos **adicionales** para agregar la funcionalidad del chat con base de datos PostgreSQL.

---

## 📋 OPCIÓN 1: Script Completo Automatizado

Guarda este script como `add-chat-db.sh` y ejecútalo en tu VPS:

```bash
cat > /root/add-chat-db.sh <<'CHATEOF'
#!/bin/bash
set -euxo pipefail

DOMAIN="downloader-pro.cgd-priv.uk"
APP_DIR="/opt/tiktok-api-3"
DB_NAME="tiktokdownloader"
DB_USER="tiktokuser"
DB_PASS="TikTok2025Seguro$(date +%s)"

echo "======================================"
echo "Instalando PostgreSQL y configurando Chat"
echo "======================================"

# 1) Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# 2) Iniciar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# 3) Crear base de datos y usuario
sudo -u postgres psql <<SQL
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
SQL

# 4) Agregar DATABASE_URL al .env
cd "$APP_DIR"
echo "" >> .env
echo "# PostgreSQL para Chat Global" >> .env
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}" >> .env

# 5) Instalar dependencias de PostgreSQL para Node.js
npm install --save @neondatabase/serverless drizzle-orm drizzle-kit ws

# 6) Ejecutar migración de base de datos
npm run db:push --force || npm run db:push || echo "⚠️ Verifica manualmente db:push"

# 7) Reiniciar la aplicación
pm2 restart tiktok-api-3

# 8) Verificar
echo ""
echo "======================================"
echo "✅ PostgreSQL instalado y configurado"
echo "======================================"
echo "Base de datos: ${DB_NAME}"
echo "Usuario: ${DB_USER}"
echo "Contraseña: ${DB_PASS}"
echo ""
echo "⚠️ GUARDA ESTA CONTRASEÑA EN UN LUGAR SEGURO"
echo ""
echo "Verificando tablas:"
sudo -u postgres psql -d ${DB_NAME} -c "\dt"
echo ""
echo "Estado de la aplicación:"
pm2 status
CHATEOF

chmod +x /root/add-chat-db.sh
bash /root/add-chat-db.sh
```

---

## 📋 OPCIÓN 2: Comandos Paso a Paso (Manual)

Si prefieres ejecutar los comandos uno por uno:

### Paso 1: Instalar PostgreSQL
```bash
apt update
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### Paso 2: Crear base de datos y usuario
```bash
sudo -u postgres psql
```

Dentro de PostgreSQL, ejecuta:
```sql
CREATE DATABASE tiktokdownloader;
CREATE USER tiktokuser WITH ENCRYPTED PASSWORD 'CambiaEstoAhoraSeguro123';
GRANT ALL PRIVILEGES ON DATABASE tiktokdownloader TO tiktokuser;
\c tiktokdownloader
GRANT ALL ON SCHEMA public TO tiktokuser;
GRANT ALL ON ALL TABLES IN SCHEMA public TO tiktokuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tiktokuser;
\q
```

### Paso 3: Agregar DATABASE_URL al archivo .env
```bash
cd /opt/tiktok-api-3
nano .env
```

Agrega al final del archivo:
```
DATABASE_URL=postgresql://tiktokuser:CambiaEstoAhoraSeguro123@localhost:5432/tiktokdownloader
```

Guarda con: `Ctrl+X`, luego `Y`, luego `Enter`

### Paso 4: Instalar dependencias de PostgreSQL
```bash
cd /opt/tiktok-api-3
npm install --save @neondatabase/serverless drizzle-orm drizzle-kit ws
```

### Paso 5: Ejecutar migración de base de datos
```bash
npm run db:push --force
```

Si da error, intenta sin `--force`:
```bash
npm run db:push
```

### Paso 6: Reiniciar la aplicación
```bash
pm2 restart tiktok-api-3
```

### Paso 7: Verificar que funciona
```bash
# Ver tablas creadas
sudo -u postgres psql -d tiktokdownloader -c "\dt"

# Ver logs de la app
pm2 logs tiktok-api-3 --lines 50

# Verificar estado
pm2 status
```

---

## 📋 OPCIÓN 3: Agregar PostgreSQL a tu Script de Deployment

Modifica tu script `deploy-downloader3.sh` agregando esto **después de la línea 11** (después de `apt install -y nginx git curl ca-certificates ufw`):

```bash
# PostgreSQL para Chat
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

DB_NAME="tiktokdownloader"
DB_USER="tiktokuser"
DB_PASS="TikTok2025Seguro$(date +%s)"

sudo -u postgres psql <<SQL
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
SQL

echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}" >> ${APP_DIR}/.env
echo "✅ PostgreSQL configurado - Usuario: ${DB_USER} - Password: ${DB_PASS}"
```

Y después de la línea que dice `npm install`, agrega:
```bash
npm install --save @neondatabase/serverless drizzle-orm drizzle-kit ws
```

---

## 🧪 PROBAR QUE EL CHAT FUNCIONA

### 1. Abre tu sitio web
```
https://downloader-pro.cgd-priv.uk
```

### 2. Ve al "Chat Global" (botón en la navegación)

### 3. Envía un mensaje de prueba

### 4. Verifica que se guardó en la base de datos
```bash
sudo -u postgres psql -d tiktokdownloader -c "SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 5;"
```

Deberías ver tu mensaje guardado.

### 5. Prueba la persistencia
- Cierra el navegador completamente
- Vuelve a abrir el sitio
- Ve al Chat Global
- **Deberías ver tu mensaje anterior** ✅

---

## 🔧 COMANDOS ÚTILES POST-INSTALACIÓN

### Ver mensajes en la base de datos
```bash
sudo -u postgres psql -d tiktokdownloader -c "SELECT username, message, timestamp FROM chat_messages ORDER BY timestamp DESC LIMIT 10;"
```

### Contar mensajes guardados
```bash
sudo -u postgres psql -d tiktokdownloader -c "SELECT COUNT(*) as total_mensajes FROM chat_messages;"
```

### Ver logs del chat en tiempo real
```bash
pm2 logs tiktok-api-3 | grep -i "websocket\|chat\|message"
```

### Limpiar mensajes antiguos (más de 30 días)
```bash
sudo -u postgres psql -d tiktokdownloader -c "DELETE FROM chat_messages WHERE timestamp < NOW() - INTERVAL '30 days';"
```

### Backup de la base de datos
```bash
sudo -u postgres pg_dump tiktokdownloader > /root/chat-backup-$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
sudo -u postgres psql -d tiktokdownloader < /root/chat-backup-20251029.sql
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "relation chat_messages does not exist"
```bash
cd /opt/tiktok-api-3
npm run db:push --force
pm2 restart tiktok-api-3
```

### Error: "password authentication failed"
```bash
# Verificar la contraseña en .env
cat /opt/tiktok-api-3/.env | grep DATABASE_URL

# Restablecer contraseña del usuario
sudo -u postgres psql -c "ALTER USER tiktokuser WITH PASSWORD 'NuevaPasswordSegura123';"

# Actualizar .env con la nueva contraseña
nano /opt/tiktok-api-3/.env
# Cambiar DATABASE_URL con la nueva password

pm2 restart tiktok-api-3
```

### WebSocket no conecta
```bash
# Verificar que Nginx tenga la configuración de WebSocket
cat /etc/nginx/sites-available/downloader-pro.cgd-priv.uk | grep -A 5 "location /v2"

# Si no está, agregar al bloque location /v2:
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

nginx -t
systemctl reload nginx
```

### Los mensajes no se muestran después de recargar
Ya está arreglado en el código actual. Si aún tienes el problema:
```bash
cd /opt/tiktok-api-3
git pull  # Para obtener la última versión con el fix
npm install
npm run build
pm2 restart tiktok-api-3
```

---

## ✅ VERIFICACIÓN COMPLETA

Ejecuta este comando para verificar todo:

```bash
echo "=== VERIFICACIÓN DEL CHAT ==="
echo ""
echo "PostgreSQL:"
systemctl status postgresql --no-pager | grep Active
echo ""
echo "Tablas en la DB:"
sudo -u postgres psql -d tiktokdownloader -c "\dt"
echo ""
echo "Total de mensajes:"
sudo -u postgres psql -d tiktokdownloader -c "SELECT COUNT(*) FROM chat_messages;"
echo ""
echo "Últimos 3 mensajes:"
sudo -u postgres psql -d tiktokdownloader -c "SELECT username, LEFT(message, 30) as mensaje, timestamp FROM chat_messages ORDER BY timestamp DESC LIMIT 3;"
echo ""
echo "App corriendo:"
pm2 status | grep tiktok-api-3
echo ""
echo "Test de conexión:"
curl -I https://downloader-pro.cgd-priv.uk/
```

---

## 🎯 RESUMEN RÁPIDO

Si ya ejecutaste tu script `deploy-downloader3.sh`, solo necesitas:

```bash
# 1. Instalar PostgreSQL
apt install -y postgresql postgresql-contrib && systemctl start postgresql

# 2. Crear DB
sudo -u postgres psql -c "CREATE DATABASE tiktokdownloader; CREATE USER tiktokuser WITH PASSWORD 'MiPassword123'; GRANT ALL ON DATABASE tiktokdownloader TO tiktokuser;"

# 3. Agregar a .env
echo "DATABASE_URL=postgresql://tiktokuser:MiPassword123@localhost:5432/tiktokdownloader" >> /opt/tiktok-api-3/.env

# 4. Instalar dependencias
cd /opt/tiktok-api-3 && npm install --save @neondatabase/serverless drizzle-orm drizzle-kit ws

# 5. Migrar
npm run db:push --force

# 6. Reiniciar
pm2 restart tiktok-api-3
```

**¡Listo!** El chat ya funciona con persistencia total. 🎉
