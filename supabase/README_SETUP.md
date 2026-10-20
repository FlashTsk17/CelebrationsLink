# CélébrationsLink — installation Supabase

Ce guide décrit l'ordre recommandé pour un **nouveau projet Supabase vide**. Les migrations de ce dépôt ont été créées à des moments différents : ne lance pas aveuglément tous les fichiers SQL dans l'ordre alphabétique.

## Ordre recommandé

1. `migrations/20261018_initial_events_guests.sql` — crée `events` et `guests`.
2. `schema.sql` — crée les profils, demandes Premium/Studio et les politiques de base.
3. `migrations/20260917_member_link.sql` — installe le déclencheur de profil à l'inscription. À installer avant de tester la création de compte.
4. `migrations/20260917_event_management_secrets.sql` — stockage serveur des jetons de gestion; dépend de `events`.
5. `migrations/20260917_celebration_media.sql` — table `celebrations`, stockage privé des images et politiques.
6. `migrations/20260917_celebration_music.sql` — bucket musique et politiques d'accès.
7. `migrations/20261001_premium_server_expiry.sql` — fonction RPC `get_my_membership()`.
8. `migrations/20261001_security_hardening.sql` — dernière couche de politiques RLS.

## Fichiers historiques à ne pas exécuter en plus

- `migrations/20260917_celebrations_cloud.sql` : crée une deuxième série de politiques sur la même table que `20260917_celebration_media.sql`. La migration `celebration_media` est retenue dans l'ordre ci-dessus.
- `migrations/20260917_music_storage.sql` : configure le même bucket que `20260917_celebration_music.sql`. Ne lance pas les deux; la migration `celebration_music` est retenue.
- `20261001_security_hardening.sql` est à exécuter après la création de toutes les tables qu'il référence.

## Important

- Ce guide vise un projet **neuf et vide**. Ne l'exécute pas sur une base existante sans audit préalable.
- Les scripts n'ont pas été exécutés sur le projet Supabase réel et ne sont pas encore validés par un test d'intégration.
- Après installation, vérifier dans Table Editor la présence de `events`, `guests`, `profiles`, `premium_requests`, `studio_requests` et `celebrations`.
- Vérifier que le trigger `on_auth_user_created` existe avant de tester l'inscription.
- Le fichier `supabase/config.toml` désactive la vérification JWT automatique uniquement pour `create-event` et `manage-basic-event`, car ces fonctions valident elles-mêmes l'utilisateur ou le jeton de gestion. Déployer ces fonctions avec cette configuration; ne pas désactiver la validation interne.
- Les fonctions Edge `create-event` et `manage-basic-event` doivent être déployées et configurées séparément. Les clés Supabase injectées automatiquement sont privilégiées uniquement côté serveur.
- **Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` dans le frontend ou dans une variable `VITE_*`. Le navigateur ne doit utiliser que l'URL Supabase et la clé anon/publishable.
- Le script de fondation active RLS et garde la liste des invités privée. Les politiques RLS ne remplacent pas les tests fonctionnels.

## Points de vérification connus

- Les réponses RSVP publiques doivent utiliser uniquement `INSERT`, sans demander la ligne insérée en retour (`INSERT ... SELECT`), afin de garder la liste des invités privée.
- Le script initial `20261018_initial_events_guests.sql` fournit les tables de base qui manquaient.
- La migration `20260917_celebration_music.sql` a été corrigée dans la branche de consolidation pour terminer correctement la politique SQL de lecture.
- Le fichier `20260917_music_storage.sql` contient également cette erreur historique et doit rester exclu de l'ordre recommandé jusqu'à correction.
