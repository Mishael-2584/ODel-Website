-- Course Builder is a connected Professional/Institution capability. The
-- trigger keeps future commercial activations aligned even when older RPCs
-- provide their original feature arrays.

UPDATE public.faculty_assistant_entitlements
   SET features = ARRAY(
         SELECT DISTINCT feature
           FROM unnest(COALESCE(features, '{}'::TEXT[]) || ARRAY['coursebuilder:write']) AS feature
       ),
       updated_at = NOW()
 WHERE plan IN ('professional', 'institution', 'pilot')
   AND NOT ('coursebuilder:write' = ANY(COALESCE(features, '{}'::TEXT[])));

UPDATE public.faculty_assistant_institution_licences
   SET features = ARRAY(
         SELECT DISTINCT feature
           FROM unnest(COALESCE(features, '{}'::TEXT[]) || ARRAY['coursebuilder:write']) AS feature
       ),
       updated_at = NOW()
 WHERE NOT ('coursebuilder:write' = ANY(COALESCE(features, '{}'::TEXT[])));

CREATE OR REPLACE FUNCTION public.faculty_assistant_enforce_connected_features()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IN ('professional', 'institution', 'pilot') THEN
    NEW.features := ARRAY(
      SELECT DISTINCT feature
        FROM unnest(COALESCE(NEW.features, '{}'::TEXT[]) || ARRAY['coursebuilder:write']) AS feature
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_faculty_assistant_connected_features
  ON public.faculty_assistant_entitlements;
CREATE TRIGGER trg_faculty_assistant_connected_features
BEFORE INSERT OR UPDATE OF plan, features
ON public.faculty_assistant_entitlements
FOR EACH ROW
EXECUTE FUNCTION public.faculty_assistant_enforce_connected_features();

CREATE OR REPLACE FUNCTION public.faculty_assistant_enforce_institution_features()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.features := ARRAY(
    SELECT DISTINCT feature
      FROM unnest(COALESCE(NEW.features, '{}'::TEXT[]) || ARRAY['coursebuilder:write']) AS feature
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_faculty_assistant_institution_features
  ON public.faculty_assistant_institution_licences;
CREATE TRIGGER trg_faculty_assistant_institution_features
BEFORE INSERT OR UPDATE OF features
ON public.faculty_assistant_institution_licences
FOR EACH ROW
EXECUTE FUNCTION public.faculty_assistant_enforce_institution_features();
