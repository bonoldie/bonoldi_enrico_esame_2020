SELECT
   *,
   ST_AsText(posizione) as posizione_coordinate,
   ST_Distance(
      info_utente.posizione,
      (
         SELECT
            posizione
         from
            info_utente
         where
            info_utente.id = $ 1
      )
   ) as distance_between
from
   info_utente
where
   (
      ST_Distance(
         info_utente.posizione,
         (
            SELECT
               posizione
            from
               info_utente
            where
               info_utente.id = $ 1
         )
      ) < $ 2
      AND position(
         (
            SELECT
               sesso
            from
               info_utente
            where
               info_utente.id = $ 1
         ) in info_utente.orientamento_aggregato
      ) > 0
      AND position(
         info_utente.sesso in (
            SELECT
               orientamento_aggregato
            from
               info_utente
            where
               info_utente.id = $ 1
         )
      ) > 0
   )
   OR info_utente.id = $ 1