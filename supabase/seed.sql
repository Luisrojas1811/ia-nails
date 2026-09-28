-- Cursos iniciales. Precios y textos provisorios hasta que Iara los confirme.
insert into public.courses (slug, name, summary, price_ars, is_published, sort_order) values
  ('soft-gel-inicial', 'Soft Gel inicial', 'Aprendé todo lo que necesitás saber desde cero sobre esta técnica para ofrecer este servicio en tu mesa de trabajo de manera segura y eficaz, cuidando la uña natural y ofreciendo un servicio bueno y duradero.', 15000, true, 1),
  ('semipermanente-nivelacion-capping-gel', 'Semipermanente, Nivelación y Capping gel', 'Aprendé estas técnicas infaltables priorizando el cuidado de la uña natural, con durabilidad y calidad.', 40000, true, 2),
  ('capping-polygel', 'Capping Polygel', 'Conocé cómo manipular este producto y ofrecé un servicio 100% de calidad para las uñas naturales.', 25000, true, 3),
  ('nail-art-inicial', 'Nail Art inicial', 'Tus infaltables en un solo taller. Empezá a realizar diseños y efectos con seguridad, aprendiendo sus técnicas y formas desde cero.', 8000, true, 4),
  ('nail-art-nivel-2', 'Nail Art nivel 2', 'Ampliá tu carpeta de diseños aprendiendo a interpretarlos con seguridad y a realizar el paso a paso de cada uno, con sus técnicas y combinaciones.', 15000, true, 5)
on conflict (slug) do update set
  name = excluded.name, summary = excluded.summary, price_ars = excluded.price_ars,
  is_published = excluded.is_published, sort_order = excluded.sort_order;
