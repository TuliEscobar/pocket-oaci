# 🗄️ Configuración del Backend (Supabase)

Para habilitar las funcionalidades Premium (Carga de documentos, Historial de chat), necesitamos una base de datos y almacenamiento. Usaremos **Supabase** por su facilidad de uso y potencia.

## 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y regístrate.
2. Crea un "New Project".
3. Dale un nombre (ej: `oaci-ai`) y una contraseña segura a la base de datos.
4. Selecciona una región cercana a tus usuarios (ej: `South America (São Paulo)` o `US East`).

## 2. Obtener Credenciales
Una vez creado el proyecto, ve a **Project Settings** -> **API**.
Copia las siguientes claves:
- **Project URL**
- **anon public key**
- **service_role key** (¡Mantenla secreta!)

## 3. Configurar Variables de Entorno
Agrega estas claves a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 4. Ejecutar Script SQL (Base de Datos)
Ve al **SQL Editor** en Supabase y ejecuta el siguiente script para crear las tablas necesarias:

```sql
-- Habilitar extensión de vectores (para futuros usos)
create extension if not exists vector;

-- Tabla de Usuarios (Sincronizada con Clerk)
create table public.users (
  id text primary key, -- Clerk ID
  email text not null,
  plan text default 'free', -- 'free', 'pro', 'enterprise'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Documentos de Usuario (Para usuarios Pro)
create table public.user_documents (
  id uuid default gen_random_uuid() primary key,
  user_id text references public.users(id) on delete cascade not null,
  filename text not null,
  file_path text not null, -- Ruta en Supabase Storage
  file_size int not null,
  status text default 'pending', -- 'pending', 'processed', 'error'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Historial de Chat
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id text references public.users(id) on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Mensajes
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  sources jsonb, -- Fuentes citadas
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configurar Storage (Bucket para documentos)
insert into storage.buckets (id, name, public) values ('user_docs', 'user_docs', false);

-- Políticas de Seguridad (RLS)
alter table public.users enable row level security;
alter table public.user_documents enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Política simple: El servicio (backend) tiene acceso total (usando service_role key)
-- Para acceso desde el cliente, necesitaríamos configurar políticas más complejas vinculadas a Clerk JWT,
-- pero por ahora gestionaremos todo desde el backend (API Routes).
```

## 5. Siguientes Pasos
Una vez configurado esto, avísame para:
1. Conectar el Webhook de Clerk para crear usuarios en Supabase automáticamente.
2. Implementar la API de carga de archivos.
3. Implementar el guardado de historial.
