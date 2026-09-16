# propoj-app — legacy / nekanonický

> **Toto NENÍ produkční zdroj pro [https://propoj.app](https://propoj.app).**

Kanonický produkční repozitář je **[JakubKroca23/propoj.app](https://github.com/JakubKroca23/propoj.app)**.  
Na produkčním serveru běží Docker Compose projekt `propojapp` z toho repo.

**Veškerá produkční práce patří tam.** Tento repo (`propoj-app`) nepoužívejte k vývoji ani k nasazení živého webu.

---

## Co je tento repo

`propoj-app` dříve držel starší strom **canvas-os** a Traefik deploy pro `propoj.app`. Aplikace, dokumentace i konfigurace byly uklizeny; git historie zůstává.

Zbývající soubory (`Dockerfile`, `docker-compose.yml`) jsou historické. Traefik labely s `Host(\`propoj.app\`)` popisují **staré** nasazení, ne aktuální produkci. Live se přesunulo do [JakubKroca23/propoj.app](https://github.com/JakubKroca23/propoj.app).
