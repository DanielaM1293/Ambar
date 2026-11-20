# Ámbar — reservas con pago

## Arranque
```
npm install
cp .env.example .env.local   # rellena lo que tengas; todo es opcional para probar
npm run db:push              # crea la base SQLite
npm run dev
```
Sin llaves de Stripe funciona en **modo demo** (reserva real en la BD, sin cobro).

## Stripe (pago real)
1. Pon `NEXT_PUBLIC_STRIPE_PK` y `STRIPE_SECRET_KEY` (modo test).
2. Webhook local: `stripe listen --forward-to localhost:3000/api/webhook`, copia el `whsec_...` a `STRIPE_WEBHOOK_SECRET`.
3. Tarjeta de prueba: 4242 4242 4242 4242, cualquier fecha futura y CVC.
4. En producción: crea el endpoint `https://tudominio.com/api/webhook` con los eventos `payment_intent.succeeded`, `payment_intent.payment_failed` y `payment_intent.canceled`.

## Flujo
- `GET /api/availability?date=YYYY-MM-DD` → cupos por franja (24 por franja, editable en `lib/config.js`).
- `POST /api/create-intent` valida todo, comprueba cupo en una transacción, crea la reserva `PENDING` (retiene cupo 15 min) y el PaymentIntent. El precio se calcula en el servidor.
- El webhook marca `PAID` y envía el correo (Resend). Si el pago falla, pasa a `CANCELLED`.
- `/reserva/[token]`: enlace privado (va en el correo y en la pantalla de confirmación) para cambiar fecha/hora (hasta 24 h antes) o cancelar. Política: ≥48 h → reembolso automático del depósito por Stripe; <48 h → sin reembolso.
- `/admin`: login con `ADMIN_KEY` (cookie httpOnly). Lista reservas y permite cancelar con reembolso total.
- `/api/cron/expire`: libera reservas sin pagar (>15 min) y envía el recordatorio 24 h antes. Vercel Cron lo llama cada hora con `Authorization: Bearer $CRON_SECRET` (en otros hosts, programa esa llamada).
- Zona horaria fija: Bogotá (UTC-5). Cambia `-05:00` en `lib/booking.js` si el restaurante está en otra.

## Producción
- SQLite no sirve en Vercel (disco efímero): cambia `provider` a `"postgresql"` en `prisma/schema.prisma` y usa Neon/Supabase en `DATABASE_URL`.
- Ejecuta `npx prisma db push` (o migraciones) en el despliegue.
