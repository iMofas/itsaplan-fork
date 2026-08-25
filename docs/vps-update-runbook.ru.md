# Обновление Itsaplan на VPS

Этот runbook описывает обновление Itsaplan на `personal-infra-vps`. Исходный
код на VPS доставляется архивом в `/srv/itsaplan/app`; git-репозитория в этом
каталоге нет.

## Перед началом

1. Прочитать `~/.claude/infra.md` на MacBook или `~/.codex/infra.md` на Mac
   Mini, а также `SERVICE_PLATFORM_BLUEPRINT.md` и `VPS_RUNBOOK.md` из проекта
   `personal-infra`.
2. Получить явное подтверждение Дениса на развёртывание.
3. Убедиться, что нужная ревизия находится в `main` fork
   `git@github.com:iMofas/itsaplan-fork.git`.
4. Выполнить проверки кода: unit-тесты изменённой части, `bun run typecheck`,
   `bun run format:check` и `bun run lint`.
5. Не читать и не выводить содержимое `/srv/itsaplan/app/.env`.

## Доступ и пути

```bash
ssh -i ~/.ssh/personal_infra_timeweb infraadmin@5.129.236.57
```

| Путь | Назначение |
| --- | --- |
| `/srv/itsaplan/app` | текущая ревизия и локальный `.env` |
| `/srv/itsaplan/releases/<revision>` | предыдущие ревизии для файлового отката |
| `/srv/itsaplan/app/docker-compose.vps.yml` | локальное переопределение loopback-портов |

Для запуска всегда объединяются два compose-файла:

```bash
docker compose -f docker-compose.yml -f docker-compose.vps.yml
```

Нельзя запускать один `docker-compose.vps.yml`: в нём есть только
переопределения, без образов и контекста сборки.

## Процесс обновления

В примерах `<revision>` — короткий SHA коммита, например `cd5efa4`.

### 1. Подготовить и отправить архив

На рабочей машине из проверенного коммита:

```bash
git archive --format=tar.gz --output=/private/tmp/itsaplan-<revision>.tgz <revision>
shasum -a 256 /private/tmp/itsaplan-<revision>.tgz
scp -i ~/.ssh/personal_infra_timeweb \
  /private/tmp/itsaplan-<revision>.tgz \
  infraadmin@5.129.236.57:/tmp/itsaplan-<revision>.tgz
```

### 2. Проверить staging-каталог

На VPS создать отдельный каталог. Существующие `.env` и
`docker-compose.vps.yml` копируются в него с сохранением прав доступа.

```bash
release=/srv/itsaplan/releases/<revision>
sudo install -d -m 750 "$release"
sudo tar -xzf /tmp/itsaplan-<revision>.tgz -C "$release"
sudo cp --preserve=mode /srv/itsaplan/app/.env "$release/.env"
sudo cp --preserve=mode /srv/itsaplan/app/docker-compose.vps.yml \
  "$release/docker-compose.vps.yml"
cd "$release"
sudo docker compose -f docker-compose.yml -f docker-compose.vps.yml config -q
sudo docker compose -f docker-compose.yml -f docker-compose.vps.yml config --services
```

Ожидаемые сервисы: `postgres`, `minio`, `minio-init`, `api`, `web`, `worker`,
`bot`.

### 3. Пересобрать и запустить

Из staging-каталога:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --build
```

API применяет новые миграции базы данных при старте. Во время пересборки web
может быть кратковременно недоступен.

### 4. Проверить результат

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.vps.yml ps
sudo docker compose -f docker-compose.yml -f docker-compose.vps.yml logs --tail=80 api worker
curl -sS -o /dev/null -w 'web=%{http_code}\n' http://127.0.0.1:8101
```

Критерии успешного обновления:

- `api` и `web` имеют статус `healthy`;
- `worker` и `bot` находятся в статусе `Up`;
- логи API содержат `Migrations applied` без ошибок;
- web возвращает `307` на `http://127.0.0.1:8101` до авторизации.

После этого вручную проверить вход в `https://its.evolveronline.uk` и основную
пользовательскую операцию изменённой функции.

### 5. Сделать новую ревизию текущей

Только после успешной проверки:

```bash
sudo test ! -e /srv/itsaplan/releases/<previous-revision>
sudo mv /srv/itsaplan/app /srv/itsaplan/releases/<previous-revision>
sudo mv /srv/itsaplan/releases/<revision> /srv/itsaplan/app
```

Это сохраняет предыдущий исходный код и локальный `.env` для файлового отката.

## Откат

Откат контейнеров выполняется из каталога предыдущей ревизии:

```bash
cd /srv/itsaplan/releases/<previous-revision>
sudo docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --build
```

После успешной проверки каталогов `app` и `releases/<previous-revision>` можно
поменять местами теми же двумя командами `mv` в обратном порядке.

Откат кода не отменяет миграции базы данных. Перед обновлением с необратимой
миграцией нужен отдельный план резервного копирования и восстановления базы.

## После обновления

1. Обновить `worklog.md` текущей ревизией и результатом проверки.
2. Добавить итоговый комментарий к задаче ИТС на русском языке.
3. Удалить временный архив из `/tmp` VPS после успешной проверки.
4. При появлении новой версии Itsaplan повторить этот runbook; перед merge
   сверить миграции и разрешить их конфликты до создания архива.
