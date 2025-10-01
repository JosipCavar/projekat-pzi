
# PubQuiz Backend (Express + MySQL)
1) Kreirajte MySQL bazu `pubquiz_db` (UTF8MB4) i importirajte `sql/schema.sql`.
2) `cd backend && npm i && cp .env.example .env` (po potrebi izmijenite vrijednosti).
3) `npm run dev` i API će raditi na `http://localhost:4000`.

Rute (primjeri):
- POST `/api/auth/register` `{ email, password, username }`
- POST `/api/auth/login` → `{ token }`
- GET `/api/events` (javno)
- POST `/api/events` (ADMIN) `{ title, scheduled_at, status }` → automatski kreira "Glavni kviz"
- GET `/api/quizzes/by-event/:eventId`
- GET `/api/quizzes/rounds/:quizId`, POST `/api/quizzes/rounds`
- GET `/api/quizzes/questions/:roundId`, POST `/api/quizzes/questions`
- GET `/api/quizzes/options/:questionId`, POST `/api/quizzes/options`
- GET `/api/reservations/games`
- POST `/api/reservations` (korisnik) `{ game_id, reserved_for }`
- GET `/api/reservations/mine` (korisnik)
- POST `/api/reservations/status/:id` (ADMIN) `{ status: 'confirmed'|'cancelled' }`
- GET `/api/users/me` (korisnik)
