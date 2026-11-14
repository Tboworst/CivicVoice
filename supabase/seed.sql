-- CivicVoice Demo Seed Data
-- All demo rows are marked with is_demo = true so they can be identified / cleaned up.
-- Run AFTER schema.sql.
--
-- UUID scheme (all hex):
--   Institutions:           a1000000-0000-0000-0000-00000000000{1-5}
--   Issues:                 b1000000-0000-0000-0000-00000000000{1-a}  (1-10)
--   Institutional responses:c1000000-0000-0000-0000-00000000000{1-5}
--   Proposals:              d1000000-0000-0000-0000-00000000000{1-5}
--   Institutional records:  e1000000-0000-0000-0000-00000000000{1-4}

-- ─────────────────────────────────────────────
-- INSTITUTIONS
-- ─────────────────────────────────────────────
insert into institutions (id, name, type, is_demo) values
  ('a1000000-0000-0000-0000-000000000001', 'Towson University',                   'university', true),
  ('a1000000-0000-0000-0000-000000000002', 'Baltimore County Public Works',       'county',     true),
  ('a1000000-0000-0000-0000-000000000003', 'Baltimore County Police Department',  'county',     true),
  ('a1000000-0000-0000-0000-000000000004', 'MTA Maryland',                        'state',      true),
  ('a1000000-0000-0000-0000-000000000005', 'Baltimore County Government',         'county',     true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- ISSUES
-- ─────────────────────────────────────────────
insert into issues (
  id, title, description, category, status,
  reporter_type, location_name, location_area,
  location_lat, location_lng, tags, vote_count, comment_count, is_demo
) values

('b1000000-0000-0000-0000-000000000001',
 'Broken Sidewalk on York Rd near Campus Gates',
 'Large sections of sidewalk between University Ave and Burke Ave are severely cracked and uplifted, creating significant accessibility barriers for students with mobility issues and wheelchair users. The damage has been worsening since last winter.',
 'infrastructure', 'under_review', 'student',
 'York Rd & University Ave', 'Towson University Area',
 39.3985, -76.6020,
 array['accessibility','sidewalk','ada-compliance'], 127, 23, true),

('b1000000-0000-0000-0000-000000000002',
 'Poor Lighting in West Village Parking Deck',
 'Multiple lighting fixtures in the West Village parking deck have been non-functional for over 3 months. The dark areas create safety concerns for students returning to their vehicles at night. Security incidents in this area have increased.',
 'safety', 'in_progress', 'student',
 'West Village Parking Deck', 'Towson University West Campus',
 39.3942, -76.6082,
 array['lighting','safety','parking','crime-prevention'], 203, 41, true),

('b1000000-0000-0000-0000-000000000003',
 'Excessive Plastic Waste in University Union Dining',
 'The University Union dining facilities use single-use plastic containers, utensils, and cups for most to-go orders despite the university''s sustainability pledges. Alternative biodegradable options are available but not implemented.',
 'environment', 'open', 'student',
 'University Union', 'Towson University Main Campus',
 39.3959, -76.6025,
 array['sustainability','waste','dining','plastic-free'], 89, 15, true),

('b1000000-0000-0000-0000-000000000004',
 'Bus Shelter Missing at Osler Drive Stop',
 'The northbound MTA bus stop on Osler Drive near the hospital complex has no shelter, leaving commuters exposed to weather. This stop serves both hospital workers and students. A shelter was promised in the 2022 county transportation plan.',
 'transportation', 'open', 'community',
 'Osler Drive @ Hospital', 'Towson Area',
 39.4012, -76.5998,
 array['bus','transit','shelter','mta'], 156, 18, true),

('b1000000-0000-0000-0000-000000000005',
 'Flooding in Loch Raven Village Apartment Complex',
 'Recurring basement flooding after moderate rainfall in the Loch Raven Village apartment complex has damaged personal property and created mold concerns for dozens of families. The stormwater drainage infrastructure is decades old and inadequate.',
 'housing', 'in_progress', 'community',
 'Loch Raven Village Apts', 'Loch Raven Area',
 39.4055, -76.5940,
 array['flooding','drainage','housing','stormwater'], 312, 67, true),

('b1000000-0000-0000-0000-000000000006',
 'Lack of Mental Health Resources for International Students',
 'International students face unique mental health challenges including cultural adjustment, language barriers, and visa-related stress, but the counseling center has limited capacity and no counselors who speak the top 5 languages of TU''s international student population.',
 'health', 'under_review', 'student',
 'Counseling Center, Administration Building', 'Towson University',
 39.3965, -76.6031,
 array['mental-health','international-students','counseling','diversity'], 178, 34, true),

('b1000000-0000-0000-0000-000000000007',
 'Digital Divide: No Affordable Broadband in East Towson',
 'Large portions of East Towson residential areas lack access to affordable high-speed internet, with the only available provider offering low speeds at high prices. This affects students trying to complete coursework from home and remote workers.',
 'technology', 'open', 'community',
 'East Towson Residential Area', 'East Towson',
 39.3870, -76.5901,
 array['broadband','digital-divide','internet-access','equity'], 94, 12, true),

('b1000000-0000-0000-0000-000000000008',
 'Illegal Dumping Behind Burke Ave Commercial Strip',
 'The alley behind the Burke Ave commercial strip has become a regular site for illegal dumping of construction debris and household waste. The area attracts pests and creates an eyesore for the adjacent residential neighborhood.',
 'environment', 'resolved', 'community',
 'Burke Ave Alley', 'Towson Commercial District',
 39.3920, -76.6058,
 array['illegal-dumping','waste','alley','neighborhood'], 67, 9, true),

('b1000000-0000-0000-0000-000000000009',
 'No Bike Lanes on York Rd Commercial Corridor',
 'York Road through Towson''s main commercial corridor has heavy traffic but no dedicated bike infrastructure, making cycling extremely dangerous. A protected bike lane was included in the 2019 master plan but never funded.',
 'transportation', 'under_review', 'community',
 'York Rd Commercial Corridor', 'Towson Commercial District',
 39.3975, -76.6035,
 array['bike-lanes','cycling','york-road','active-transportation'], 221, 29, true),

('b1000000-0000-0000-0000-00000000000a',
 'Inadequate Snow Removal on Pedestrian Paths in TU',
 'After snowfall, pedestrian pathways across Towson University campus remain icy and uncleared for 24-48 hours, creating significant fall hazards. The main roads are cleared promptly but walkways and ramps are neglected.',
 'infrastructure', 'in_progress', 'faculty',
 'TU Campus Pedestrian Paths', 'Towson University',
 39.3959, -76.6025,
 array['snow-removal','accessibility','winter','pedestrian'], 145, 22, true)

on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- INSTITUTIONAL RESPONSES
-- ─────────────────────────────────────────────
insert into institutional_responses (
  id, issue_id, institution, institution_id,
  contact_name, contact_title, status, response, responded_at, is_demo
) values

('c1000000-0000-0000-0000-000000000001',
 'b1000000-0000-0000-0000-000000000001',
 'Baltimore County Public Works',
 'a1000000-0000-0000-0000-000000000002',
 'James Mitchell', 'Director of Sidewalk Maintenance',
 'in_progress',
 'We have assessed the reported sidewalk damage on York Road and confirm it meets criteria for priority repair under our ADA compliance program. Work has been scheduled for the next fiscal quarter. We apologize for the inconvenience.',
 now() - interval '5 days', true),

('c1000000-0000-0000-0000-000000000002',
 'b1000000-0000-0000-0000-000000000002',
 'Towson University Facilities',
 'a1000000-0000-0000-0000-000000000001',
 'Sandra Lee', 'Associate VP for Facilities',
 'in_progress',
 'We have engaged our electrical contractor to replace all non-functional fixtures in the West Village deck. Additional security cameras have been authorized for installation. Work will begin within 2 weeks.',
 now() - interval '12 days', true),

('c1000000-0000-0000-0000-000000000003',
 'b1000000-0000-0000-0000-000000000005',
 'Baltimore County Government',
 'a1000000-0000-0000-0000-000000000005',
 'Robert Chen', 'County Engineer',
 'acknowledged',
 'The Loch Raven Village stormwater issue has been added to our capital improvement project list. An engineering assessment will be conducted within 60 days. We understand the urgency and are committed to a long-term fix.',
 now() - interval '20 days', true),

('c1000000-0000-0000-0000-000000000004',
 'b1000000-0000-0000-0000-000000000008',
 'Baltimore County Public Works',
 'a1000000-0000-0000-0000-000000000002',
 null, null,
 'resolved',
 'The illegal dumping site behind Burke Ave has been cleared. We have installed no-dumping signs and increased patrol frequency. The issue has been resolved; please contact 311 if dumping resumes.',
 now() - interval '30 days', true),

('c1000000-0000-0000-0000-000000000005',
 'b1000000-0000-0000-0000-000000000006',
 'Towson University',
 'a1000000-0000-0000-0000-000000000001',
 'Dr. Maria Gonzalez', 'Dean of Students',
 'acknowledged',
 'We acknowledge the gap in multilingual mental health support. We are actively recruiting counselors with language skills in Mandarin, Korean, Hindi, Spanish, and Arabic. Additionally, we are partnering with a telehealth provider to offer interim support in multiple languages.',
 now() - interval '8 days', true)

on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- PROPOSALS
-- ─────────────────────────────────────────────
insert into proposals (
  id, title, description, related_issue_ids,
  estimated_cost, estimated_impact, status, vote_count, is_ai_generated, is_demo
) values

('d1000000-0000-0000-0000-000000000001',
 'Complete Streets York Road Redesign',
 'Redesign York Road corridor with protected bike lanes, improved bus stops, and widened ADA-compliant sidewalks. Coordinate with MTA for enhanced bus shelter installation. Implement raised crosswalks at key intersections.',
 array[
   'b1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000009'
 ]::uuid[],
 '$2.4M–$3.1M', 'Affects ~12,000 daily users; reduces conflict points by 40%',
 'under_review', 312, false, true),

('d1000000-0000-0000-0000-000000000002',
 'TU Green Campus Initiative: Zero Single-Use Plastics',
 'Phase out single-use plastics across all campus dining operations. Implement a reusable container checkout program, install water refill stations, and partner with local composting services. Projected to eliminate 180,000 plastic items per year.',
 array['b1000000-0000-0000-0000-000000000003']::uuid[],
 '$85,000 initial investment', 'Net positive within 18 months; reduces waste 70%',
 'proposed', 189, false, true),

('d1000000-0000-0000-0000-000000000003',
 'Smart Lighting Upgrade for Parking Structures',
 'AI-driven LED lighting upgrade for all campus parking structures, with motion-sensing and scheduled intensity adjustments. Integrates with the campus safety app to report outages automatically and dispatch maintenance.',
 array['b1000000-0000-0000-0000-000000000002']::uuid[],
 '$340,000', 'Reduces energy cost 55%; improves incident response time',
 'approved', 267, true, true),

('d1000000-0000-0000-0000-000000000004',
 'Community Broadband Cooperative for East Towson',
 'Establish a community-owned fiber broadband cooperative serving East Towson neighborhoods. Partner with Baltimore County''s digital equity fund and federal ACP subsidies to offer $15/month plans for income-qualified households.',
 array['b1000000-0000-0000-0000-000000000007']::uuid[],
 '$1.8M (grant-eligible)', 'Closes digital divide for ~3,200 households',
 'proposed', 143, true, true),

('d1000000-0000-0000-0000-000000000005',
 'Multicultural Mental Health Counseling Hub',
 'Establish a dedicated multicultural counseling center co-located in the International Student Services building. Hire 3 FTE counselors with multilingual and multicultural competencies, and implement a 24/7 crisis text line in 5 languages.',
 array['b1000000-0000-0000-0000-000000000006']::uuid[],
 '$420,000/year', 'Serves 2,100+ international students; reduces crisis incidents',
 'under_review', 198, false, true)

on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- INSTITUTIONAL RECORDS  (accountability)
-- ─────────────────────────────────────────────
insert into institutional_records (
  id, institution, institution_id, title, description,
  record_type, status, due_date, related_issue_ids, is_demo
) values

('e1000000-0000-0000-0000-000000000001',
 'Towson University', 'a1000000-0000-0000-0000-000000000001',
 'Plastic-Free Campus Pledge by 2026',
 'Commitment to eliminate single-use plastics from all dining and event operations by Fall 2026.',
 'commitment', 'in_progress', '2026-08-31',
 array['b1000000-0000-0000-0000-000000000003']::uuid[], true),

('e1000000-0000-0000-0000-000000000002',
 'Baltimore County Government', 'a1000000-0000-0000-0000-000000000005',
 'Loch Raven Stormwater Capital Improvement',
 'Capital project to upgrade aging stormwater infrastructure in the Loch Raven Village area.',
 'budget', 'pending', '2027-06-30',
 array['b1000000-0000-0000-0000-000000000005']::uuid[], true),

('e1000000-0000-0000-0000-000000000003',
 'MTA Maryland', 'a1000000-0000-0000-0000-000000000004',
 'Osler Drive Bus Shelter Installation',
 'Installation of weatherproof bus shelter at Osler Drive northbound stop per 2022 transport plan.',
 'commitment', 'pending', '2025-12-31',
 array['b1000000-0000-0000-0000-000000000004']::uuid[], true),

('e1000000-0000-0000-0000-000000000004',
 'Towson University', 'a1000000-0000-0000-0000-000000000001',
 'West Village Safety Lighting & Cameras',
 'Complete replacement of West Village parking deck lighting and installation of 8 security cameras.',
 'milestone', 'in_progress', '2025-02-28',
 array['b1000000-0000-0000-0000-000000000002']::uuid[], true)

on conflict (id) do nothing;
