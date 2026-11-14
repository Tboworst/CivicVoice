/**
 * DEMONSTRATION DATA
 * This file contains clearly labeled sample data used to demonstrate
 * the CivicVoice interface. No real votes, statistics, or institutional
 * responses are represented here.
 */

import type {
  Issue,
  Proposal,
  InstitutionalResponse,
  CategoryStat,
  ActivityDataPoint,
} from "@/types";

export const DEMO_ISSUES: Issue[] = [
  {
    id: "issue-001",
    title: "Broken Streetlights Along York Road Near Campus",
    description:
      "Multiple streetlights between the TU main entrance and Bosley Ave have been out for over three weeks. The stretch near the 7900 block is completely dark at night, creating a serious safety hazard for students walking to off-campus housing and the nearby bus stops. Several near-miss incidents have been reported to campus security.",
    category: "infrastructure",
    status: "under_review",
    votes: 247,
    submittedAt: "2024-11-01T14:23:00Z",
    location: {
      name: "York Road & Bosley Ave",
      lat: 39.4017,
      lng: -76.5987,
      area: "York Road Corridor",
    },
    tags: ["lighting", "pedestrian safety", "york road"],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    commentCount: 34,
    reporterType: "student",
  },
  {
    id: "issue-002",
    title: "Severe Parking Shortage at Towson Town Center",
    description:
      "The parking situation at Towson Town Center has become critical on weekends and holiday periods. Shoppers are circling for 30+ minutes and spilling into adjacent residential streets in Ruxton and Stoneleigh. The problem is exacerbated by limited transit options to the mall.",
    category: "transit",
    status: "open",
    votes: 189,
    submittedAt: "2024-10-28T09:15:00Z",
    location: {
      name: "Towson Town Center",
      lat: 39.3912,
      lng: -76.61,
      area: "Towson Town Center",
    },
    tags: ["parking", "congestion", "retail"],
    imageUrl: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=80",
    commentCount: 21,
    reporterType: "resident",
  },
  {
    id: "issue-003",
    title: "Food Desert in West Towson — No Grocery Store Within 1.5 Miles",
    description:
      "Residents in the West Towson area, particularly around the Edmondson Heights and Sudbrook neighborhoods, have no walkable grocery options. The nearest supermarket requires a car or multiple bus transfers. This disproportionately affects elderly residents and low-income families. A community needs assessment conducted by TU sociology students confirmed this gap.",
    category: "community",
    status: "in_progress",
    votes: 312,
    submittedAt: "2024-10-15T11:30:00Z",
    location: {
      name: "West Towson / Edmondson Heights",
      lat: 39.3886,
      lng: -76.614,
      area: "West Towson",
    },
    tags: ["food access", "equity", "walkability", "community health"],
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    commentCount: 56,
    reporterType: "resident",
  },
  {
    id: "issue-004",
    title: "Unsafe Bike Lanes on Dulaney Valley Road",
    description:
      "The painted bike lanes on Dulaney Valley Road north of campus are inconsistently marked, merge unexpectedly with turning lanes, and lack any physical separation from traffic. Cyclists regularly swerve into the travel lane near the intersection with Fairmount Ave. Three accidents involving cyclists have occurred in this stretch in the past year.",
    category: "safety",
    status: "open",
    votes: 156,
    submittedAt: "2024-11-03T16:45:00Z",
    location: {
      name: "Dulaney Valley Rd & Fairmount Ave",
      lat: 39.4055,
      lng: -76.6072,
      area: "North Campus Corridor",
    },
    tags: ["cycling", "bike safety", "road design", "dulaney valley"],
    imageUrl: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&q=80",
    commentCount: 18,
    reporterType: "student",
  },
  {
    id: "issue-005",
    title: "Poor Public Transit Connectivity to MARC Train Station",
    description:
      "Despite Towson University having 23,000+ students and thousands of commuters daily, there is no direct, frequent bus connection to the nearest MARC station at Timonium/Lutherville. Students without cars spend up to 90 minutes commuting from downtown Baltimore. MTA Circulator routes don't reach Towson, and existing #8 and #19 bus routes are infrequent and unreliable.",
    category: "transit",
    status: "under_review",
    votes: 423,
    submittedAt: "2024-10-05T13:00:00Z",
    location: {
      name: "Towson University — Main Entrance",
      lat: 39.3952,
      lng: -76.6025,
      area: "TU Campus",
    },
    tags: ["marc train", "public transit", "commuter", "mta"],
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    commentCount: 89,
    reporterType: "student",
  },
  {
    id: "issue-006",
    title: "Construction Noise from University Ave Disrupts Student Housing",
    description:
      "The ongoing utility infrastructure project on University Ave near the student apartment complexes (The Spot, Villas at Towson) starts jackhammering at 7 AM, well before the standard 8 AM local ordinance threshold. Residents have documented this violation repeatedly. Night-shift workers and students studying for finals are significantly impacted.",
    category: "campus",
    status: "resolved",
    votes: 93,
    submittedAt: "2024-09-20T08:00:00Z",
    location: {
      name: "University Ave, Towson",
      lat: 39.3975,
      lng: -76.6032,
      area: "TU Campus",
    },
    tags: ["noise", "construction", "ordinance", "student housing"],
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    commentCount: 12,
    reporterType: "student",
  },
  {
    id: "issue-007",
    title: "TU Science Complex Elevator Frequently Out of Service",
    description:
      "The main elevator in the Smith Hall science complex has been intermittently broken for months, leaving mobility-impaired students unable to access upper-floor classrooms and labs. ADA compliance requires reliable vertical access. Currently, affected students must reroute through a separate building adding 10+ minutes to their route.",
    category: "accessibility",
    status: "in_progress",
    votes: 201,
    submittedAt: "2024-10-22T10:00:00Z",
    location: {
      name: "Smith Hall, Towson University",
      lat: 39.3961,
      lng: -76.6018,
      area: "TU Campus",
    },
    tags: ["ADA", "elevator", "accessibility", "smith hall"],
    imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    commentCount: 29,
    reporterType: "student",
  },
  {
    id: "issue-008",
    title: "Flooding at Towson Commons Underpass After Heavy Rain",
    description:
      "The pedestrian underpass connecting the east and west sides of campus near Towson Commons floods to ankle depth after any significant rainfall. Storm drain infrastructure appears undersized. This forces hundreds of students to take lengthy detours and has caused property damage to nearby facilities.",
    category: "infrastructure",
    status: "open",
    votes: 134,
    submittedAt: "2024-11-08T07:30:00Z",
    location: {
      name: "Towson Commons Underpass",
      lat: 39.3945,
      lng: -76.6038,
      area: "TU Campus",
    },
    tags: ["flooding", "stormwater", "infrastructure", "pedestrian"],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80",
    commentCount: 15,
    reporterType: "faculty",
  },
  {
    id: "issue-009",
    title: "Lack of Affordable Housing Near Campus Displacing Students",
    description:
      "Rising rents in the Towson area have increased by 28% over three years, far outpacing student financial aid increases. Many students are forced into 90+ minute commutes or housing instability. The TU area needs protected student housing zones and affordable unit requirements in new developments.",
    category: "housing",
    status: "open",
    votes: 538,
    submittedAt: "2024-09-30T12:00:00Z",
    location: {
      name: "Towson, Maryland",
      lat: 39.3959,
      lng: -76.608,
      area: "Greater Towson",
    },
    tags: ["affordable housing", "rent", "displacement", "equity"],
    imageUrl: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80",
    commentCount: 112,
    reporterType: "student",
  },
  {
    id: "issue-010",
    title: "Air Quality Near Dulaney Valley Road During Rush Hour",
    description:
      "Vehicle emissions monitoring data shared by Towson University's environmental science department shows PM2.5 levels along Dulaney Valley Road spike to concerning levels during morning and evening rush hours. Students and residents with respiratory conditions are particularly vulnerable. Planting buffer vegetation and improving transit would help.",
    category: "environment",
    status: "under_review",
    votes: 178,
    submittedAt: "2024-10-12T15:00:00Z",
    location: {
      name: "Dulaney Valley Rd, Towson",
      lat: 39.4042,
      lng: -76.6058,
      area: "North Campus Corridor",
    },
    tags: ["air quality", "environment", "emissions", "health"],
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    commentCount: 23,
    reporterType: "faculty",
  },
];

export const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    title: "Towson–MARC Express Shuttle Service",
    description:
      "Establish a dedicated hourly shuttle connecting Towson University and the Timonium MARC Station, running Monday–Saturday from 6 AM to 10 PM. Partner with MTA Maryland to subsidize fares for TU ID holders. Initial phase: 2 dedicated vehicles, evaluated after 6 months.",
    category: "transit",
    status: "under_consideration",
    votes: 672,
    relatedIssueIds: ["issue-005", "issue-002"],
    estimatedImpact: "Est. 2,400 daily riders, reducing 180+ car trips per day",
    createdAt: "2024-10-20T10:00:00Z",
    aiGenerated: true,
    implementingBody: "MTA Maryland / Towson University",
  },
  {
    id: "prop-002",
    title: "York Road Smart Street Lighting Upgrade",
    description:
      "Replace aging sodium-vapor streetlights along the York Road corridor from Joppa Road to Bosley Ave with LED smart lighting equipped with motion sensors and remote monitoring. Phased implementation starting with the highest-priority dark stretches near student housing.",
    category: "infrastructure",
    status: "approved",
    votes: 445,
    relatedIssueIds: ["issue-001"],
    estimatedImpact: "Covers 1.2-mile stretch, 40% energy savings, 24/7 monitoring",
    createdAt: "2024-10-25T09:00:00Z",
    aiGenerated: false,
    implementingBody: "Baltimore County Dept. of Public Works",
  },
  {
    id: "prop-003",
    title: "Towson Affordable Housing Inclusionary Zoning Policy",
    description:
      "Advocate for Baltimore County to adopt a 15% affordable unit requirement for all new residential developments of 20+ units in the Towson Urban Rural Demarcation Line. Include rent protections for existing tenants within 0.5 miles of TU campus.",
    category: "housing",
    status: "proposed",
    votes: 831,
    relatedIssueIds: ["issue-009"],
    estimatedImpact:
      "Could add 200–400 affordable units over 5 years based on projected development pipeline",
    createdAt: "2024-10-18T14:00:00Z",
    aiGenerated: true,
    implementingBody: "Baltimore County Council / TU Office of Gov't Relations",
  },
  {
    id: "prop-004",
    title: "Dulaney Valley Protected Bike Lane Installation",
    description:
      "Convert existing painted bike lanes to protected lanes with physical barriers on Dulaney Valley Road from Joppa Road to University Ave. Add signalized crossings at key intersections. Partner with Baltimore County and SHA for funding under Maryland's Bikeways program.",
    category: "safety",
    status: "under_consideration",
    votes: 334,
    relatedIssueIds: ["issue-004", "issue-010"],
    estimatedImpact: "0.8-mile protected corridor, estimated 300+ daily cyclists",
    createdAt: "2024-11-01T11:00:00Z",
    aiGenerated: false,
    implementingBody: "Baltimore County Dept. of Transportation / SHA",
  },
  {
    id: "prop-005",
    title: "West Towson Community Fresh Food Hub",
    description:
      "Partner with an established grocery cooperative or food access nonprofit to establish a community-owned fresh food hub in West Towson. Explore the vacant retail space on Edmondson Ave. TU nutrition and business students can support operations as a community engagement practicum.",
    category: "community",
    status: "proposed",
    votes: 478,
    relatedIssueIds: ["issue-003"],
    estimatedImpact:
      "Serves est. 4,200 residents in food-insecure area, potential 15 FTE jobs",
    createdAt: "2024-11-05T16:00:00Z",
    aiGenerated: true,
    implementingBody: "TU Office of Community Engagement / Baltimore County",
  },
];

export const DEMO_INSTITUTIONAL_RESPONSES: InstitutionalResponse[] = [
  {
    id: "resp-001",
    institution: "Towson University — Facilities Management",
    issueId: "issue-007",
    issueTitle: "TU Science Complex Elevator Frequently Out of Service",
    response:
      "We have confirmed the Smith Hall elevator issue and contracted Otis Elevator for a comprehensive modernization. A temporary access plan has been coordinated with the ADA Compliance Office to ensure no student misses class during repairs.",
    status: "in_progress",
    date: "2024-10-28T10:00:00Z",
    contactName: "Marcus Chen",
    contactTitle: "Director of Facilities Management",
    commitmentDeadline: "2024-12-15T00:00:00Z",
  },
  {
    id: "resp-002",
    institution: "Baltimore County Dept. of Public Works",
    issueId: "issue-001",
    issueTitle: "Broken Streetlights Along York Road Near Campus",
    response:
      "Work order issued for immediate inspection and repair of the affected streetlights on York Road. The 7900 block has been prioritized. We are also evaluating this corridor for inclusion in the FY25 Smart Lighting capital program.",
    status: "committed",
    date: "2024-11-05T14:00:00Z",
    contactName: "Sarah Johnson",
    contactTitle: "Deputy Director, Infrastructure Maintenance",
    commitmentDeadline: "2024-11-30T00:00:00Z",
  },
  {
    id: "resp-003",
    institution: "Towson University — Student Affairs",
    issueId: "issue-006",
    issueTitle: "Construction Noise from University Ave",
    response:
      "After coordinating with Baltimore County, the contractor has been notified and has agreed to restrict work hours to 8 AM–5 PM as required. University Ave construction is on track for completion by end of November. We apologize for the disruption.",
    status: "completed",
    date: "2024-10-05T09:00:00Z",
    contactName: "Dr. Patricia Williams",
    contactTitle: "VP for Student Affairs",
  },
  {
    id: "resp-004",
    institution: "MTA Maryland",
    issueId: "issue-005",
    issueTitle: "Poor Public Transit Connectivity to MARC Train Station",
    response:
      "MTA Maryland has acknowledged this connectivity gap and is including the Towson–MARC corridor in our FY26 service expansion analysis. We are in preliminary discussions with Towson University regarding a potential partnership for a pilot shuttle program.",
    status: "acknowledged",
    date: "2024-11-10T11:00:00Z",
    contactName: "Kevin Park",
    contactTitle: "Manager, Planning & Analysis",
  },
  {
    id: "resp-005",
    institution: "Baltimore County Planning Department",
    issueId: "issue-009",
    issueTitle: "Lack of Affordable Housing Near Campus",
    response:
      "The affordable housing issue near Towson University is noted. Baltimore County is currently updating its Comprehensive Master Plan, which includes new inclusionary zoning provisions. Public comment sessions are scheduled for December 2024.",
    status: "acknowledged",
    date: "2024-11-08T13:00:00Z",
    contactName: "Lisa Hernandez",
    contactTitle: "Deputy Director, Community Development",
  },
];

export const DEMO_CATEGORY_STATS: CategoryStat[] = [
  { category: "housing", count: 538, percentage: 22, change: 15 },
  { category: "transit", count: 612, percentage: 25, change: 8 },
  { category: "infrastructure", count: 381, percentage: 16, change: -3 },
  { category: "safety", count: 290, percentage: 12, change: 5 },
  { category: "campus", count: 247, percentage: 10, change: 2 },
  { category: "community", count: 312, percentage: 13, change: 11 },
  { category: "environment", count: 178, percentage: 7, change: 4 },
  { category: "accessibility", count: 201, percentage: 8, change: 7 },
];

export const DEMO_ACTIVITY_DATA: ActivityDataPoint[] = [
  { date: "Oct 1", issues: 3, votes: 42, proposals: 0 },
  { date: "Oct 7", issues: 5, votes: 89, proposals: 1 },
  { date: "Oct 14", issues: 7, votes: 134, proposals: 1 },
  { date: "Oct 21", issues: 9, votes: 198, proposals: 2 },
  { date: "Oct 28", issues: 11, votes: 267, proposals: 2 },
  { date: "Nov 4", issues: 14, votes: 341, proposals: 3 },
  { date: "Nov 11", issues: 16, votes: 428, proposals: 4 },
  { date: "Nov 14", issues: 18, votes: 489, proposals: 5 },
];

// Summary stats for the platform
export const DEMO_PLATFORM_STATS = {
  totalIssues: 18,
  totalVotes: 2474,
  activeProposals: 5,
  resolvedIssues: 3,
  participatingResidents: 847,
  institutionalResponses: 5,
  topPriorityCategory: "transit" as const,
  dataAsOf: "2024-11-14",
};
