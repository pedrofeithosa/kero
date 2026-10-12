CREATE POLICY "catalog read all"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'catalog');

CREATE POLICY "catalog write staff"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'catalog' AND public.is_manager(auth.uid()));

CREATE POLICY "catalog update staff"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'catalog' AND public.is_manager(auth.uid()))
  WITH CHECK (bucket_id = 'catalog' AND public.is_manager(auth.uid()));

CREATE POLICY "catalog delete staff"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'catalog' AND public.is_manager(auth.uid()));