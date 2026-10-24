# CélébrationsLink — installation Supabase

## Migrations versionnées

Les migrations de `supabase/migrations/` ont été normalisées en noms à 14 chiffres et ordonnées par dépendance. Pour un **nouveau projet Supabase vide**, Supabase CLI les appliquera dans cet ordre :

1. `20261024000100_initial_events_guests.sql` — tables `events` et `guests`.
2. `20261024000200_profiles_and_requests.sql` — profils, demandes Premium/Studio et politiques de base (reprend le contenu de référence de `schema.sql`).
3. `20261024000300_member_link.sql` — trigger de profil à l'inscription et backfill des comptes Auth déjà existants.
4. `20261024000400_event_management_secrets.sql` — stockage serveur des hashes de jetons de gestion.
5. `20261024000500_celebration_media.sql` — table `celebrations`, bucket privé des images et politiques.
6. `20261024000600_celebration_music.sql` — bucket privé musique et politiques.
7. `20261024000700_premium_server_expiry.sql` — RPC `get_my_membership()`.
8. `20261024000800_security_hardening.sql` — couche finale de sécurité RLS.

Les anciennes migrations aux préfixes de dates incohérents et les migrations historiques dupliquées ont été retirées du dossier de migrations pour empêcher qu'elles soient appliquées automatiquement dans un ordre incorrect. `supabase/schema.sql` est conservé comme fichier de référence historique; la migration versionnée n° 2 est celle à utiliser avec la CLI.

## Précautions avant déploiement

- **Ne lance pas ces migrations sur la base de production sans inspection préalable et sauvegarde.** Le contenu actuel du projet Supabase doit être vérifié : l'absence de tables dans l'interface ne prouve pas qu'aucun objet ou donnée n'existe.
- Ces fichiers ont été relus et réordonnés dans GitHub, mais **n'ont pas encore été exécutés contre une base Supabase réelle ni validés par un test d'intégration**.
- Pour tester, utiliser d'abord une base de développement jetable vide. Vérifier la présence de `events`, `guests`, `profiles`, `premium_requests`, `studio_requests`, `celebrations` et `event_management_secrets`, le trigger `on_auth_user_created), la RPC et les deux buckets.
- Ne pas lancer `supabase db reset` sur la production : cette commande est destinée à réinitialiser une base locale.
- Les réponses RSVP publiques doivent faire un `INSERT` sans demander la ligne créée en retour, afin de ne pas nécessiter un droit de lecture public sur la liste des invités.
- Le fichier `supabase/config.toml` désactive la vérification JWT automatique uniquement pour `create-event` et `manage-basic-event`; les fonctions doivent continuer à valider elles-mêmes l'identité ou le jeton de gestion.
- Les Edge Functions doivent être déployées séparément. Ajouter le code à GitHub ne les déploie pas sur Supabase.
- Ne jamais exposer de clé `service_role` ou `secret` dans le frontend, dans une variable `VITE_*`, ni dans un dépôt public. Le navigateur doit utiliser uniquement la clé publique/anon appropriée.
- Les buckets d'images et de musique sont privés. Tester les URL signées et s'assurer qu'un utilisateur ne peut pas accéder aux fichiers d'un autre utilisateur.

## Contrôles encore nécessaires avant mise en production

1. Tester les migrations sur une base de développement vierge et vérifier qu'elles passent toutes dans l'ordre.
2. Ajouter/exécuter des tests RLS pour visiteur anonyme, propriétaire, autre utilisateur connecté et champs Premium.
3. Vérifier les variables serveur et déployer les deux Edge Functions.
4. Tester de bout en bout : création de compte, connexion, création d'événement, ouverture du lien public, RSVP, espace membre et création de célébration.
5. Vérifier les limites de débit sur les endpoints publics. Les protections anti-abus doivent être confirmées avant d'ouvrir la création anonyme à grande échelle.

Ce guide ne remplace pas l'audit de l'état actuel de la base de production.
