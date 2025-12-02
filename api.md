# Finance Dairy API

Все эндпоинты требуют заголовок `Authorization: Bearer <supabase_access_token>`. Ответы в JSON; коды ошибок: `400` при некорректном вводе, `401` без токена, `403` при отсутствии прав, `404` при отсутствии ресурса.

## Workspaces
- **GET /api/workspaces** — список рабочих пространств текущего пользователя.  
  Query:  
  - `search` — подстрочный поиск по названию и slug (регистронезависимый)  
  - `slug` — точное совпадение slug  
  - `role` — фильтр по роли участника (owner/member/...)  
  Ответ: `[{ "id": "1", "name": "My workspace", "role": "owner" }]`
- **POST /api/workspaces** — создать workspace.  
  Тело:  
  ```json
  { "name": "My workspace" }
  ```
  Ответ: `{ "ok": true, "id": "1" }`
- **PATCH /api/workspaces/[id]** — обновить имя (нужна членство).  
  Тело:  
  ```json
  { "name": "New name" }
  ```
  Ответ: `{ "ok": true }`
- **DELETE /api/workspaces/[id]** — удалить (только owner).  
  Ответ: `{ "ok": true }`

## Workspace Members
- **GET /api/workspaces/[id]/members** — список участников (нужна членство).  
  Ответ: `[{ "id": "10", "userId": "uuid", "role": "member" }]`
- **POST /api/workspaces/[id]/members** — добавить участника (только owner).  
  Тело:  
  ```json
  { "user_id": "uuid-of-user", "role": "member" } // role опционально, по умолчанию member
  ```
  Ответ: `{ "ok": true, "id": "10" }`
- **PATCH /api/workspaces/[id]/members** — сменить роль (только owner).  
  Тело:  
  ```json
  { "member_id": "10", "role": "viewer" }
  ```
  Ответ: `{ "ok": true }`
- **DELETE /api/workspaces/[id]/members?memberId=10** — удалить участника (только owner).  
  Ответ: `{ "ok": true }`

## Transactions
- **GET /api/transactions** — список операций по workspace (нужна членство).  
  Query:  
  - `workspaceId` (обязателен)  
  - `startDate`, `endDate` (ISO-строки дат)  
  - `categoryId`, `paymentTypeId`, `currencyId` (числа)  
  - `isDecrease` (`true`|`false`)  
  Ответ: `[{ ...transaction }]`
- **POST /api/transactions** — создать операцию (user_id берётся из токена).  
  Тело:  
  ```json
  {
    "workspace_id": 1,
    "payment_type_id": 2,
    "category_id": 3,
    "currency_id": 1,
    "amount": "100.50",
    "date": "2024-01-01T00:00:00.000Z",
    "comment": "optional",
    "is_decrease": true
  }
  ```
  Ответ: `{ "ok": true, "id": 123 }`
- **GET /api/transactions/[id]** — получить операцию (проверка членства workspace).  
  Ответ: `{ ...transaction }`
- **PATCH /api/transactions/[id]** — частичное обновление.  
  Тело (любые поля опционально):  
  ```json
  {
    "payment_type_id": 2,
    "category_id": 3,
    "currency_id": 1,
    "amount": "120.00",
    "date": "2024-02-01T00:00:00.000Z",
    "comment": "note",
    "is_decrease": false
  }
  ```
  Ответ: `{ "ok": true }`
- **DELETE /api/transactions/[id]** — удалить операцию.  
  Ответ: `{ "ok": true }`

## Dictionaries — Categories (workspace scope)
- **GET /api/dictionaries/categories?workspaceId=1** — список (нужна членство).  
  Ответ: `[{ "id": 1, "name": "Food", "icon": "🍔", "color": "#ffcc00", "workspace_id": 1 }]`
- **POST /api/dictionaries/categories** — создать (нужна членство).  
  Тело:  
  ```json
  { "name": "Food", "icon": "🍔", "color": "#ffcc00", "workspace_id": 1 }
  ```
  Ответ: `{ "ok": true, "id": 1 }`
- **PATCH /api/dictionaries/categories/[id]** — обновить (только owner workspace).  
  Тело:  
  ```json
  { "name": "Groceries", "icon": "🛒", "color": "#00ffcc" }
  ```
  Ответ: `{ "ok": true }`
- **DELETE /api/dictionaries/categories/[id]** — удалить (только owner).  
  Ответ: `{ "ok": true }`

## Dictionaries — Payment Types (workspace scope)
- **GET /api/dictionaries/payment_types?workspaceId=1** — список (нужна членство).  
  Ответ: `[{ "id": 1, "name": "Card", "icon": "💳", "default_currency_id": 1, "workspace_id": 1 }]`
- **POST /api/dictionaries/payment_types** — создать (нужна членство).  
  Тело:  
  ```json
  { "name": "Card", "icon": "💳", "default_currency_id": 1, "workspace_id": 1 }
  ```
  Ответ: `{ "ok": true, "id": 1 }`
- **PATCH /api/dictionaries/payment_types/[id]** — обновить (только owner workspace).  
  Тело:  
  ```json
  { "name": "Cash", "icon": "💵", "default_currency_id": 1 }
  ```
  Ответ: `{ "ok": true }`
- **DELETE /api/dictionaries/payment_types/[id]** — удалить (только owner).  
  Ответ: `{ "ok": true }`

## Dictionaries — Currencies (global)
- **GET /api/dictionaries/currencies** — список (нужен токен).  
  Ответ: `[{ "id": 1, "code": "USD", "name": "US Dollar", "symbol": "$" }]`
- **POST /api/dictionaries/currencies** — создать (нужен токен).  
  Тело:  
  ```json
  { "code": "EUR", "name": "Euro", "symbol": "€" }
  ```
  Ответ: `{ "ok": true, "id": 1 }`
- **PATCH /api/dictionaries/currencies/[id]** — обновить (нужен токен).  
  Тело:  
  ```json
  { "code": "GBP", "name": "Pound", "symbol": "£" }
  ```
  Ответ: `{ "ok": true }`
- **DELETE /api/dictionaries/currencies/[id]** — удалить (нужен токен).  
  Ответ: `{ "ok": true }`
