# 🚀 Comandos para VPS - Chat con Almacenamiento Local (SIN PostgreSQL)

## Los mensajes se guardan en archivos JSON en tu VPS

---

## PASO 1: Conectar a tu VPS

```bash
ssh root@tu-servidor.com
```

---

## PASO 2: Ejecutar tu script de deployment normal

```bash
bash /root/deploy-downloader3.sh
```

Espera a que termine completamente.

---

## PASO 3: Ir al directorio de la aplicación

```bash
cd /opt/tiktok-api-3
```

---

## PASO 4: Crear carpeta para guardar mensajes

```bash
mkdir -p data
chmod 755 data
```

---

## PASO 5: Crear archivo de almacenamiento vacío

```bash
echo '[]' > data/chat-messages.json
chmod 666 data/chat-messages.json
```

---

## PASO 6: Verificar que los archivos están bien

```bash
ls -la data/
cat data/chat-messages.json
```

Deberías ver: `[]`

---

## PASO 7: Reiniciar la aplicación

```bash
pm2 restart tiktok-api-3
```

---

## PASO 8: Ver logs para verificar que arrancó bien

```bash
pm2 logs tiktok-api-3 --lines 30
```

Presiona `Ctrl+C` para salir de los logs.

---

## PASO 9: Verificar que el chat funciona

Abre tu navegador y ve a:
```
https://downloader-pro.cgd-priv.uk
```

1. Haz clic en **"Chat Global"**
2. Ingresa tu nombre y edad
3. Envía un mensaje de prueba

---

## PASO 10: Verificar que el mensaje se guardó

```bash
cat /opt/tiktok-api-3/data/chat-messages.json
```

Deberías ver tu mensaje guardado en formato JSON.

---

## ✅ ¡LISTO! El chat ya funciona con almacenamiento local

Los mensajes se guardan en: `/opt/tiktok-api-3/data/chat-messages.json`

---

## 🔧 Comandos útiles

### Ver todos los mensajes guardados
```bash
cat /opt/tiktok-api-3/data/chat-messages.json | python3 -m json.tool
```

### Contar cuántos mensajes hay
```bash
cat /opt/tiktok-api-3/data/chat-messages.json | grep -o '"id":' | wc -l
```

### Ver los últimos 5 mensajes
```bash
cat /opt/tiktok-api-3/data/chat-messages.json | python3 -m json.tool | tail -50
```

### Limpiar todos los mensajes (CUIDADO - borra todo)
```bash
echo '[]' > /opt/tiktok-api-3/data/chat-messages.json
pm2 restart tiktok-api-3
```

### Hacer backup de los mensajes
```bash
cp /opt/tiktok-api-3/data/chat-messages.json /root/chat-backup-$(date +%Y%m%d).json
```

### Restaurar backup
```bash
cp /root/chat-backup-20251029.json /opt/tiktok-api-3/data/chat-messages.json
pm2 restart tiktok-api-3
```

### Ver logs del chat en tiempo real
```bash
pm2 logs tiktok-api-3 | grep -i "chat\|websocket\|message"
```

### Ver cuánto espacio ocupa el archivo de mensajes
```bash
du -h /opt/tiktok-api-3/data/chat-messages.json
```

---

## 🎯 Prueba completa

1. **Envía un mensaje** en el chat
2. **Ejecuta este comando:**
   ```bash
   cat /opt/tiktok-api-3/data/chat-messages.json | python3 -m json.tool
   ```
3. **Deberías ver tu mensaje** en formato JSON bonito
4. **Cierra el navegador completamente**
5. **Vuelve a abrir** https://downloader-pro.cgd-priv.uk
6. **Ve al Chat Global**
7. **¡Tu mensaje debería seguir ahí!** ✅

---

## 📦 Backup automático diario (opcional)

### Crear script de backup
```bash
cat > /usr/local/bin/backup-chat.sh <<'BACKUP'
#!/bin/bash
BACKUP_DIR="/var/backups/chat"
mkdir -p $BACKUP_DIR
cp /opt/tiktok-api-3/data/chat-messages.json $BACKUP_DIR/chat-$(date +%Y%m%d-%H%M%S).json
find $BACKUP_DIR -name "chat-*.json" -mtime +7 -delete
echo "Backup completado: $(date)"
BACKUP

chmod +x /usr/local/bin/backup-chat.sh
```

### Programar backup diario a las 3am
```bash
crontab -e
```

Agrega esta línea al final:
```
0 3 * * * /usr/local/bin/backup-chat.sh >> /var/log/chat-backup.log 2>&1
```

Guarda con: `Ctrl+X`, luego `Y`, luego `Enter`

### Probar el backup manualmente
```bash
bash /usr/local/bin/backup-chat.sh
ls -lh /var/backups/chat/
```

---

## 🐛 Solución de problemas

### Problema: Los mensajes no se guardan

```bash
# Verificar permisos
ls -la /opt/tiktok-api-3/data/

# Dar permisos correctos
chmod 755 /opt/tiktok-api-3/data
chmod 666 /opt/tiktok-api-3/data/chat-messages.json

# Reiniciar
pm2 restart tiktok-api-3
```

### Problema: Error "ENOENT: no such file or directory"

```bash
# Crear directorio y archivo
mkdir -p /opt/tiktok-api-3/data
echo '[]' > /opt/tiktok-api-3/data/chat-messages.json
chmod 755 /opt/tiktok-api-3/data
chmod 666 /opt/tiktok-api-3/data/chat-messages.json

# Reiniciar
pm2 restart tiktok-api-3
```

### Problema: El archivo JSON está corrupto

```bash
# Ver el archivo
cat /opt/tiktok-api-3/data/chat-messages.json

# Si está mal, recrearlo
echo '[]' > /opt/tiktok-api-3/data/chat-messages.json
pm2 restart tiktok-api-3
```

### Problema: WebSocket no conecta

```bash
# Ver logs
pm2 logs tiktok-api-3 --err --lines 50

# Reiniciar todo
pm2 restart tiktok-api-3
systemctl restart nginx
```

---

## 📊 Verificación del sistema

```bash
echo "=== VERIFICACIÓN DEL CHAT ==="
echo ""
echo "Directorio de datos:"
ls -lh /opt/tiktok-api-3/data/
echo ""
echo "Archivo de mensajes existe:"
[ -f /opt/tiktok-api-3/data/chat-messages.json ] && echo "✅ SÍ" || echo "❌ NO"
echo ""
echo "Mensajes guardados:"
cat /opt/tiktok-api-3/data/chat-messages.json | grep -o '"id":' | wc -l
echo ""
echo "Tamaño del archivo:"
du -h /opt/tiktok-api-3/data/chat-messages.json
echo ""
echo "Estado de la app:"
pm2 status | grep tiktok-api-3
echo ""
echo "Últimos logs:"
pm2 logs tiktok-api-3 --lines 10 --nostream
```

---

## 💡 Ventajas de este sistema

✅ **Super simple** - No necesitas PostgreSQL ni MySQL  
✅ **Sin instalaciones extra** - Solo archivos JSON  
✅ **Fácil de hacer backup** - Solo copia el archivo  
✅ **Fácil de migrar** - Mueve el archivo a otro servidor  
✅ **Portable** - Funciona en cualquier servidor con Node.js  
✅ **Ligero** - Usa muy poca memoria y disco  

---

## ⚠️ Notas importantes

1. **Backups**: Haz backups regulares del archivo `chat-messages.json`
2. **Límite de mensajes**: Si tienes millones de mensajes, considera limpiar los antiguos
3. **Permisos**: El archivo debe ser legible y escribible por la app
4. **No editar manualmente**: No edites el JSON a mano, puedes corromperlo

---

## 🎉 ¡Todo listo!

Tu chat está funcionando con almacenamiento local en:
```
/opt/tiktok-api-3/data/chat-messages.json
```

Los mensajes **NUNCA** se borran al:
- ✅ Cerrar el navegador
- ✅ Cambiar de pestaña
- ✅ Reiniciar el servidor
- ✅ Actualizar la aplicación

Solo se borran si:
- ❌ Eliminas el archivo manualmente
- ❌ Lo sobrescribes con `echo '[]' >`
