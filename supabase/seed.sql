INSERT INTO public.workspace (id, name, description) VALUES
    ('9c3c3f56-d71b-404a-821e-96b93906451c', 'Healthcare', 'A set of notional clinical letters'),
    ('f73f221c-f93e-417a-94df-50071dca8397', 'Media', 'A set of notional news articles'),
    ('8c0a99a7-d8a2-4f99-8b04-206c6e4e26cc', 'Legal', 'A set of contracts'),
    ('1add93ce-dc9e-4acb-9ab8-e7bf3866aba9', 'Finance', 'A set of financial documents')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_access (id, user_id, workspace_id, is_owner, is_demo) VALUES
    ('d0000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', '9c3c3f56-d71b-404a-821e-96b93906451c', false, true),
    ('d0000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'f73f221c-f93e-417a-94df-50071dca8397', false, true),
    ('d0000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', '8c0a99a7-d8a2-4f99-8b04-206c6e4e26cc', false, true),
    ('d0000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', '1add93ce-dc9e-4acb-9ab8-e7bf3866aba9', false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_config (id, workspace_id, name, content) VALUES
    ('c0000000-0000-4000-8000-000000000001', '9c3c3f56-d71b-404a-821e-96b93906451c', 'config.json',
     '{"entities":[{"name":"Prescription","attributes":[{"name":"Name","values":[],"allowCustomValues":true},{"name":"Dose","values":[],"allowCustomValues":true},{"name":"Unit","values":["mg","g","ml"],"allowCustomValues":true},{"name":"Frequency","values":[],"allowCustomValues":true}]},{"name":"Diagnosis","attributes":[{"name":"Certainty","values":["confirmed","suspected"],"allowCustomValues":false}]},{"name":"Person","attributes":[{"name":"Role","values":["patient","clinician","relative"],"allowCustomValues":true}]}],"globalAttributes":[{"name":"Negated","values":["yes","no"],"allowCustomValues":false}]}'),
    ('c0000000-0000-4000-8000-000000000002', 'f73f221c-f93e-417a-94df-50071dca8397', 'config.json',
     '{"entities":[{"name":"Person","attributes":[{"name":"Role","values":[],"allowCustomValues":true}]},{"name":"Organisation","attributes":[]},{"name":"Location","attributes":[]},{"name":"Date","attributes":[]}],"globalAttributes":[]}'),
    ('c0000000-0000-4000-8000-000000000003', '8c0a99a7-d8a2-4f99-8b04-206c6e4e26cc', 'config.json',
     '{"entities":[{"name":"Party","attributes":[{"name":"Role","values":["supplier","customer"],"allowCustomValues":true}]},{"name":"Term","attributes":[{"name":"Duration","values":[],"allowCustomValues":true}]},{"name":"Obligation","attributes":[]},{"name":"Governing Law","attributes":[]}],"globalAttributes":[]}'),
    ('c0000000-0000-4000-8000-000000000004', '1add93ce-dc9e-4acb-9ab8-e7bf3866aba9', 'config.json',
     '{"entities":[{"name":"Company","attributes":[]},{"name":"Amount","attributes":[{"name":"Currency","values":["GBP","USD","EUR"],"allowCustomValues":true},{"name":"Value","values":[],"allowCustomValues":true}]},{"name":"Period","attributes":[]},{"name":"Metric","attributes":[]}],"globalAttributes":[]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_document (id, workspace_id, name, content) VALUES
    ('e0000000-0000-4000-8000-000000000001', '9c3c3f56-d71b-404a-821e-96b93906451c', 'letter-1.txt',
     E'Dear Dr. Patel,\n\nI reviewed Mrs. Jane Holloway in clinic today. She has a confirmed diagnosis of type 2 diabetes and reports no chest pain. I have started metformin 500mg twice daily and advised her to reduce her sugar intake.\n\nHer mother also has type 2 diabetes.\n\nYours sincerely,\nDr. Amir Khan'),
    ('e0000000-0000-4000-8000-000000000002', '9c3c3f56-d71b-404a-821e-96b93906451c', 'letter-2.txt',
     E'Dear Dr. Okafor,\n\nMr. Tom Reyes attended with suspected asthma. Peak flow was reduced. I prescribed salbutamol 100mcg as required and beclometasone 200mcg twice a day. There is no history of eczema.\n\nKind regards,\nDr. Lucy Chen'),
    ('e0000000-0000-4000-8000-000000000003', 'f73f221c-f93e-417a-94df-50071dca8397', 'article-1.txt',
     E'Northfield council approves new cycle lanes\n\nNorthfield city council voted on Tuesday 4 March to approve 12 miles of protected cycle lanes. Council leader Maria Santos said the scheme would be completed by spring next year. The Northfield Cycling Trust welcomed the decision.'),
    ('e0000000-0000-4000-8000-000000000004', 'f73f221c-f93e-417a-94df-50071dca8397', 'article-2.txt',
     E'Harbour Robotics opens Leeds office\n\nHarbour Robotics, a start-up founded by engineer David Mensah, opened its first office in Leeds on Monday. The company plans to hire 40 staff by the end of the year.'),
    ('e0000000-0000-4000-8000-000000000005', '8c0a99a7-d8a2-4f99-8b04-206c6e4e26cc', 'contract-1.txt',
     E'SERVICES AGREEMENT\n\nThis agreement is made between Brightwater Ltd (the "Supplier") and Kestrel Foods plc (the "Customer").\n\n1. Term. This agreement starts on the effective date and continues for 24 months.\n\n2. Obligations. The Supplier shall provide monthly maintenance of the Customer''s refrigeration equipment.\n\n3. Governing law. This agreement is governed by the laws of England and Wales.'),
    ('e0000000-0000-4000-8000-000000000006', '1add93ce-dc9e-4acb-9ab8-e7bf3866aba9', 'report-1.txt',
     E'Quarterly results\n\nAldgate Systems reported revenue of GBP 48.2 million for the third quarter of 2026, up 12% year on year. Operating margin improved to 18%. Net debt fell to GBP 9.5 million.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ontology (id, name, description, is_default) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'Sample clinical terms', 'A small sample terminology for local development', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ontology_concept (id, ontology_id, name, code) VALUES
    ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Type 2 diabetes mellitus', 'DEMO-001'),
    ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Asthma', 'DEMO-002'),
    ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Metformin', 'DEMO-003'),
    ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Salbutamol', 'DEMO-004'),
    ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Beclometasone', 'DEMO-005'),
    ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Eczema', 'DEMO-006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_ontology (id, workspace_id, ontology_id) VALUES
    ('f0000000-0000-4000-8000-000000000001', '9c3c3f56-d71b-404a-821e-96b93906451c', 'a0000000-0000-4000-8000-000000000001')
ON CONFLICT DO NOTHING;
