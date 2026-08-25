# Handoff: Itsaplan

Дата: 2026-08-24

## Статус

- Исходный код клонирован на MacBook в эту папку.
- Текущий зафиксированный commit: `3795e10` (`feat: add story point and time estimates to issues (#214)`).
- Рабочее дерево чистое.
- Проект пока не запускался и не был опубликован.
- Создавать проекты, агентов и runner в Itsaplan пока не нужно: сначала
  поднять пустую защищённую платформу на будущем Timeweb VPS.

## Инфраструктурное решение

Itsaplan разворачивается не на Mac Mini, а на отдельном Timeweb VPS. Общая
инфраструктура и миграция Mozart/Renewlet ведутся в соседнем проекте:

`/Users/mofas/Projects/personal-infra/VPS_MIGRATION_PLAN.md`

Для Itsaplan нужны два адреса:

- `https://its.evolveronline.uk` — web;
- `https://api-its.evolveronline.uk` — API.

Перед web и API будет Cloudflare Access только для владельца. Затем остаётся
собственная авторизация Itsaplan как второй слой.

## Важное про старую попытку Cloudflare Tunnel

- Работы с Tunnel на Mac Mini поставлены на паузу.
- DNS-адреса для Itsaplan не публиковались.
- Не переиспользовать локальные Tunnel-файлы на Mac Mini: целевой подход —
  Cloudflare DNS → Caddy на Timeweb VPS, без Tunnel.

## Что делать следующей сессии Itsaplan

1. Начать после готовности базового Timeweb VPS из проекта `personal-infra`.
2. Прочитать корневой `AGENTS.md` репозитория и этот handoff.
3. Развернуть закреплённую версию Itsaplan отдельным Docker Compose стеком.
4. Настроить внутренние PostgreSQL/Redis и persistent volumes.
5. Подключить Caddy и оба поддомена через Cloudflare.
6. Настроить Cloudflare Access и выполнить функциональную проверку.
7. Не запускать создание проектов/агентов/runner без отдельного решения.

## Безопасность

- Секреты не добавлять в git и не писать в этот файл.
- Никакой деплой или DNS-переключение без отдельного подтверждения владельца.
- Cloudflare API-токен и Timeweb API-токен уже хранятся локально в
  `~/.codex/secrets/`; значения не читать и не выводить.
