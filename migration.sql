-- migration.sql
-- Script to migrate the 'redacoes' table to the new schema with JSONB and renamed columns

-- 1. Rename existing string/text columns
ALTER TABLE redacoes RENAME COLUMN id_redacao TO internal_id;
ALTER TABLE redacoes RENAME COLUMN titulo TO title;
ALTER TABLE redacoes RENAME COLUMN texto TO essay;
ALTER TABLE redacoes RENAME COLUMN data_base TO created_at_old;

-- 2. Add new columns
ALTER TABLE redacoes ADD COLUMN genre text;
ALTER TABLE redacoes ADD COLUMN statement text;
ALTER TABLE redacoes ADD COLUMN support_text text;
ALTER TABLE redacoes ADD COLUMN consumer_init timestamptz;
ALTER TABLE redacoes ADD COLUMN consumer_finish timestamptz;
ALTER TABLE redacoes ADD COLUMN updated_at timestamptz;

-- 3. Add JSONB columns
ALTER TABLE redacoes ADD COLUMN evaluated_skills jsonb;
ALTER TABLE redacoes ADD COLUMN assessed_skills jsonb;
ALTER TABLE redacoes ADD COLUMN extra_fields jsonb;

-- 4. Migrate existing data to JSONB
UPDATE redacoes SET
  evaluated_skills = jsonb_build_array(
    jsonb_build_object('score', criterio_1_nota, 'comment', criterio_1_devolutiva),
    jsonb_build_object('score', criterio_2_nota, 'comment', criterio_2_devolutiva),
    jsonb_build_object('score', criterio_3_nota, 'comment', criterio_3_devolutiva),
    jsonb_build_object('score', criterio_4_nota, 'comment', criterio_4_devolutiva),
    jsonb_build_object('score', criterio_5_nota, 'comment', criterio_5_devolutiva)
  ),
  extra_fields = jsonb_build_object(
    'redacao_tema', titulo_modelo,
    'redacao_ano_serie', nr_serie,
    'cd_tipo_ensino', cd_tipo_ensino,
    'nm_tipo_ensino', nm_tipo_ensino
  );

-- 5. Drop old columns
ALTER TABLE redacoes DROP COLUMN criterio_1_nota;
ALTER TABLE redacoes DROP COLUMN criterio_1_devolutiva;
ALTER TABLE redacoes DROP COLUMN criterio_2_nota;
ALTER TABLE redacoes DROP COLUMN criterio_2_devolutiva;
ALTER TABLE redacoes DROP COLUMN criterio_3_nota;
ALTER TABLE redacoes DROP COLUMN criterio_3_devolutiva;
ALTER TABLE redacoes DROP COLUMN criterio_4_nota;
ALTER TABLE redacoes DROP COLUMN criterio_4_devolutiva;
ALTER TABLE redacoes DROP COLUMN criterio_5_nota;
ALTER TABLE redacoes DROP COLUMN criterio_5_devolutiva;
ALTER TABLE redacoes DROP COLUMN nota_geral;
ALTER TABLE redacoes DROP COLUMN comentario_geral;
ALTER TABLE redacoes DROP COLUMN titulo_modelo;
ALTER TABLE redacoes DROP COLUMN nr_serie;
ALTER TABLE redacoes DROP COLUMN cd_tipo_ensino;
ALTER TABLE redacoes DROP COLUMN nm_tipo_ensino;
ALTER TABLE redacoes DROP COLUMN created_at_old;
