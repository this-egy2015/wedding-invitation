.DEFAULT_GOAL := help

.PHONY: help setup services migrate seed seed-remote seeded dev backup check build start

help:
	@printf '%s\n' \
	  'make setup    Install dependency dan buat .env.local jika belum ada' \
	  'make services Jalankan Supabase lokal (Docker harus aktif)' \
	  'make migrate  Terapkan migration SQLite' \
	  'make seed     Migrasi lalu isi undangan dan upload gambar' \
	  'make seeded   Supabase → migrasi → seed → dev server' \
	  'make seed-remote Migrasi + seed Turso/Storage dari .env.production.local' \
	  'make dev      Dev server tanpa mengulang seed' \
	  'make backup   Backup SQLite yang konsisten' \
	  'make check    Typecheck, test, dan build berurutan' \
	  'make build    Build produksi lokal' \
	  'make start    Jalankan hasil build produksi lokal' \
	  'Panduan: readme-howto.md'

setup:
	npm ci
	@if [ ! -e .env.local ]; then (umask 077; cp .env.example .env.local); fi
	@printf '%s\n' 'Isi .env.local dan siapkan owner sesuai readme-howto.md sebelum make seeded.'

services:
	./node_modules/.bin/supabase start

migrate:
	npm run db:migrate

seed: migrate
	npm run db:seed

seed-remote:
	APP_ENV_FILE=.env.production.local VERCEL=1 $(MAKE) seed

# Recursive targets keep the flow sequential even with make -j.
seeded:
	$(MAKE) services
	$(MAKE) seed
	$(MAKE) dev

dev:
	npm run dev

backup:
	npm run db:backup

check:
	npm run typecheck
	npm test
	npm run build

build:
	npm run build

start:
	npm run start
