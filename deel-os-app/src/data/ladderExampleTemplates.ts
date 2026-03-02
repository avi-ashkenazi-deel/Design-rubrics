export interface TrafficLightExamples {
  red: string[];
  yellow: string[];
  green: string[];
}

// Key format: "focusArea::role"
export const DEFAULT_LADDER_EXAMPLES: Record<string, TrafficLightExamples> = {

  // ═══════════════════════════════════════════
  //  PROBLEM SOLVING
  // ═══════════════════════════════════════════

  'Problem Solving::Product Designer': {
    red: [
      'Waits for others to define the problem before starting any work.',
      'Jumps to the first solution without exploring alternatives or gathering context.',
    ],
    yellow: [
      'Identifies obvious problems but misses underlying root causes.',
      'Proposes solutions that work but doesn\'t consider edge cases or constraints.',
    ],
    green: [
      'Breaks down ambiguous problems into clear, actionable steps with minimal guidance.',
      'Considers multiple approaches and validates assumptions with data before committing.',
    ],
  },

  'Problem Solving::Senior Designer': {
    red: [
      'Relies on familiar patterns without adapting to new problem contexts.',
      'Escalates problems that are well within their scope to solve independently.',
    ],
    yellow: [
      'Solves problems effectively but rarely challenges the problem framing itself.',
      'Considers constraints but doesn\'t proactively seek new information to reframe.',
    ],
    green: [
      'Reframes problems to uncover better opportunities and higher-impact outcomes.',
      'Brings structure to ambiguity and helps the team navigate complex tradeoffs.',
    ],
  },

  'Problem Solving::Staff Designer': {
    red: [
      'Focuses on tactical fixes without connecting solutions to broader product strategy.',
      'Doesn\'t proactively identify systemic issues that span multiple product areas.',
    ],
    yellow: [
      'Identifies cross-team problems but defers ownership to others.',
      'Proposes solutions that work locally but miss system-wide implications.',
    ],
    green: [
      'Identifies and addresses systemic problems that affect multiple teams and products.',
      'Creates reusable frameworks that help others solve similar problems independently.',
    ],
  },

  'Problem Solving::Senior Staff Designer': {
    red: [
      'Gets pulled into tactical problem-solving instead of driving strategic clarity.',
      'Misses opportunities to connect problems across verticals into unified solutions.',
    ],
    yellow: [
      'Sees cross-vertical problems but struggles to align diverse stakeholders on solutions.',
      'Provides strong analysis but doesn\'t consistently drive decisions forward.',
    ],
    green: [
      'Connects problems across verticals and drives alignment on strategic solutions at scale.',
      'Builds shared mental models that help the org understand and tackle complex challenges.',
    ],
  },

  'Problem Solving::Principal Designer': {
    red: [
      'Focuses on individual problems rather than shaping the company\'s problem-solving culture.',
      'Doesn\'t leverage seniority to influence how the organization approaches challenges.',
    ],
    yellow: [
      'Identifies company-level problems but struggles to mobilize resources and sponsorship.',
      'Drives good solutions locally but doesn\'t scale them across the organization.',
    ],
    green: [
      'Shapes how the company approaches design problems at a cultural and methodological level.',
      'Identifies and resolves company-wide design challenges with lasting, scalable impact.',
    ],
  },

  'Problem Solving::Lead Product Designer': {
    red: [
      'Solves problems for their team rather than coaching them to solve problems independently.',
      'Focuses only on design problems and ignores broader cross-functional challenges.',
    ],
    yellow: [
      'Helps the team solve problems but doesn\'t systematically improve their problem-solving skills.',
      'Addresses problems as they arise but doesn\'t anticipate issues before they surface.',
    ],
    green: [
      'Creates an environment where the team tackles ambiguous problems with confidence.',
      'Anticipates problems early and coaches the team to develop strong analytical habits.',
    ],
  },

  'Problem Solving::Group Design Manager': {
    red: [
      'Lets problems escalate across teams before intervening or providing direction.',
      'Doesn\'t connect problem-solving approaches across the teams they manage.',
    ],
    yellow: [
      'Resolves cross-team problems when raised but doesn\'t proactively detect them.',
      'Supports teams in problem-solving but doesn\'t set systematic standards.',
    ],
    green: [
      'Establishes problem-solving rituals and standards across multiple teams.',
      'Proactively identifies cross-team friction points and resolves them before they escalate.',
    ],
  },

  'Problem Solving::Director': {
    red: [
      'Gets too deep into individual problems instead of setting strategic direction.',
      'Doesn\'t create systems for teams to escalate and resolve problems efficiently.',
    ],
    yellow: [
      'Addresses cross-functional problems well but doesn\'t institutionalize solutions.',
      'Provides guidance on complex problems but only when asked.',
    ],
    green: [
      'Creates decision-making frameworks that empower leads to solve problems autonomously.',
      'Drives cross-functional alignment on complex, multi-vertical challenges proactively.',
    ],
  },

  'Problem Solving::Senior Director': {
    red: [
      'Focuses on tactical problem resolution instead of building org-wide problem-solving capability.',
      'Doesn\'t connect patterns across their areas of responsibility.',
    ],
    yellow: [
      'Sees org-wide patterns but takes too long to mobilize solutions.',
      'Solves strategic problems well but doesn\'t develop leaders to do the same.',
    ],
    green: [
      'Builds organizational capability so complex problems are resolved at the right level.',
      'Connects patterns across multiple areas and drives preemptive strategic action.',
    ],
  },

  'Problem Solving::VP Design': {
    red: [
      'Doesn\'t set a clear problem-solving philosophy for the design organization.',
      'Gets involved in operational problems that should be handled by directors.',
    ],
    yellow: [
      'Sets good direction for problem-solving but doesn\'t ensure consistent execution.',
      'Identifies industry-level challenges but doesn\'t translate them into actionable strategy.',
    ],
    green: [
      'Establishes a problem-solving culture that attracts top talent and drives innovation.',
      'Anticipates market and organizational challenges and positions the team to address them proactively.',
    ],
  },

  // ═══════════════════════════════════════════
  //  ADAPTABILITY
  // ═══════════════════════════════════════════

  'Adaptability::Product Designer': {
    red: [
      'Struggles when requirements change and needs significant support to re-orient.',
      'Resists feedback and sticks rigidly to initial design direction.',
    ],
    yellow: [
      'Adjusts to changes when clearly communicated but doesn\'t anticipate them.',
      'Accepts feedback but takes time to incorporate it into their workflow.',
    ],
    green: [
      'Pivots quickly when priorities shift and maintains quality under changing conditions.',
      'Actively seeks feedback and iterates rapidly based on new information.',
    ],
  },

  'Adaptability::Senior Designer': {
    red: [
      'Becomes frustrated or disengaged when project scope shifts significantly.',
      'Applies the same process regardless of context or project needs.',
    ],
    yellow: [
      'Adapts to change but doesn\'t help others on the team adjust.',
      'Modifies approach when asked but doesn\'t proactively anticipate needed changes.',
    ],
    green: [
      'Thrives in ambiguity and helps the team stay productive during pivots.',
      'Adjusts design processes and methods to fit the unique needs of each project.',
    ],
  },

  'Adaptability::Staff Designer': {
    red: [
      'Pushes for process consistency even when the situation calls for flexibility.',
      'Doesn\'t adjust their leadership approach across different team dynamics.',
    ],
    yellow: [
      'Adapts their own work well but doesn\'t scale adaptability practices to teams.',
      'Recognizes when change is needed but is slow to drive organizational shifts.',
    ],
    green: [
      'Models adaptive behavior that influences how multiple teams respond to change.',
      'Designs flexible systems and processes that can evolve with shifting priorities.',
    ],
  },

  'Adaptability::Senior Staff Designer': {
    red: [
      'Clings to established strategies even when market or org conditions have changed.',
      'Doesn\'t adjust cross-vertical plans when new information emerges.',
    ],
    yellow: [
      'Adjusts strategy when prompted but doesn\'t lead proactive pivots.',
      'Adapts well in their domain but doesn\'t help other verticals adapt.',
    ],
    green: [
      'Proactively shifts cross-vertical strategy when conditions change, bringing others along.',
      'Builds organizational resilience by preparing teams for multiple possible futures.',
    ],
  },

  'Adaptability::Principal Designer': {
    red: [
      'Holds onto a vision too rigidly when the company or market has moved on.',
      'Doesn\'t model adaptability for the organization during major shifts.',
    ],
    yellow: [
      'Adapts personal approach but doesn\'t systematically help the org become more adaptive.',
      'Recognizes major shifts but response is slower than the pace of change.',
    ],
    green: [
      'Leads the organization through major transitions with clarity and composure.',
      'Creates a culture where adaptability is a core competency, not just a reaction.',
    ],
  },

  'Adaptability::Lead Product Designer': {
    red: [
      'Shields the team from change rather than helping them build resilience.',
      'Doesn\'t adjust team processes when project conditions evolve.',
    ],
    yellow: [
      'Communicates changes to the team but doesn\'t coach them through transitions.',
      'Adjusts plans when needed but creates unnecessary churn for the team.',
    ],
    green: [
      'Helps the team embrace change by providing context and adjusting workstreams smoothly.',
      'Builds a team culture where pivots are handled with minimal disruption and high morale.',
    ],
  },

  'Adaptability::Group Design Manager': {
    red: [
      'Applies the same management approach to all teams regardless of their maturity.',
      'Resists organizational changes that affect their teams\' established workflows.',
    ],
    yellow: [
      'Adapts to change personally but doesn\'t ensure leads and teams follow suit.',
      'Adjusts priorities when directed but doesn\'t proactively reallocate resources.',
    ],
    green: [
      'Quickly reallocates resources and adjusts team structures when priorities shift.',
      'Coaches leads to be adaptive and builds change-readiness across all their teams.',
    ],
  },

  'Adaptability::Director': {
    red: [
      'Commits to plans too rigidly and doesn\'t course-correct based on results.',
      'Creates processes that are too rigid for the pace of organizational change.',
    ],
    yellow: [
      'Adjusts direction when data clearly shows the need, but not before.',
      'Adapts strategy well but doesn\'t communicate the "why" effectively to teams.',
    ],
    green: [
      'Builds adaptive planning processes that allow for rapid pivots without losing direction.',
      'Leads cross-functional partners through change with clear rationale and minimal friction.',
    ],
  },

  'Adaptability::Senior Director': {
    red: [
      'Doesn\'t anticipate organizational shifts and is caught flat-footed by changes.',
      'Struggles to realign multiple teams when company strategy evolves.',
    ],
    yellow: [
      'Manages change well within their org but doesn\'t influence cross-org adaptability.',
      'Responds to change effectively but doesn\'t build systems for ongoing adaptability.',
    ],
    green: [
      'Anticipates major shifts and pre-positions the organization to respond effectively.',
      'Creates organizational structures that are inherently adaptable to changing conditions.',
    ],
  },

  'Adaptability::VP Design': {
    red: [
      'Doesn\'t evolve the design organization\'s strategy as the company scales.',
      'Is too committed to a specific operating model and resists evolution.',
    ],
    yellow: [
      'Adapts the team\'s strategy but doesn\'t do it quickly enough to stay ahead.',
      'Recognizes the need for change but implementation is inconsistent.',
    ],
    green: [
      'Continuously evolves the design organization to match the company\'s growth stage.',
      'Anticipates industry and market shifts and positions design as a strategic advantage.',
    ],
  },

  // ═══════════════════════════════════════════
  //  CUSTOMER FOCUS
  // ═══════════════════════════════════════════

  'Customer Focus::Product Designer': {
    red: [
      'Designs based on assumptions without seeking direct user input or data.',
      'Focuses on visual polish over solving actual user problems.',
    ],
    yellow: [
      'Incorporates user feedback when provided but doesn\'t proactively seek it out.',
      'Understands user needs for their features but not the broader user journey.',
    ],
    green: [
      'Proactively conducts user research and brings insights into every design decision.',
      'Advocates for the user in cross-functional discussions with supporting evidence.',
    ],
  },

  'Customer Focus::Senior Designer': {
    red: [
      'Makes design decisions based on personal preference rather than user evidence.',
      'Doesn\'t connect individual feature work to broader customer outcomes.',
    ],
    yellow: [
      'Uses existing research effectively but doesn\'t identify gaps in understanding.',
      'Considers the user but doesn\'t push back on requirements that harm user experience.',
    ],
    green: [
      'Identifies unmet user needs that inform product strategy, not just feature design.',
      'Champions customer-centric thinking across the team and influences prioritization.',
    ],
  },

  'Customer Focus::Staff Designer': {
    red: [
      'Gets disconnected from actual users as they focus on systems and strategy.',
      'Doesn\'t ensure that design systems and patterns serve real user needs.',
    ],
    yellow: [
      'Maintains user focus in their own work but doesn\'t scale it across teams.',
      'Understands customer segments but doesn\'t drive cross-product customer journey thinking.',
    ],
    green: [
      'Drives customer journey thinking across multiple product areas and teams.',
      'Ensures design systems and standards are grounded in validated user needs.',
    ],
  },

  'Customer Focus::Senior Staff Designer': {
    red: [
      'Loses touch with customer reality while focusing on organizational strategy.',
      'Doesn\'t connect cross-vertical work back to customer impact.',
    ],
    yellow: [
      'Considers customer impact in strategy but doesn\'t systematically measure it.',
      'Advocates for customers at a high level but doesn\'t ensure follow-through.',
    ],
    green: [
      'Connects cross-vertical strategy directly to measurable customer outcomes.',
      'Builds organizational capabilities to continuously deepen customer understanding.',
    ],
  },

  'Customer Focus::Principal Designer': {
    red: [
      'Sets design vision disconnected from customer reality or market needs.',
      'Doesn\'t establish customer-centric principles for the broader organization.',
    ],
    yellow: [
      'Incorporates customer thinking into vision but doesn\'t drive accountability for outcomes.',
      'Understands customer trends but doesn\'t translate them into actionable direction.',
    ],
    green: [
      'Sets a customer-centric design vision that influences company product strategy.',
      'Establishes practices that keep the entire design org deeply connected to customers.',
    ],
  },

  'Customer Focus::Lead Product Designer': {
    red: [
      'Doesn\'t ensure the team regularly engages with users or uses research.',
      'Prioritizes delivery speed over customer quality without making conscious tradeoffs.',
    ],
    yellow: [
      'Encourages user research but doesn\'t build it into team workflows.',
      'Reviews designs for user impact but doesn\'t coach the team to self-assess.',
    ],
    green: [
      'Builds a team culture where every designer regularly engages with users.',
      'Ensures design decisions are consistently validated with customer evidence.',
    ],
  },

  'Customer Focus::Group Design Manager': {
    red: [
      'Teams under their management lack consistent customer research practices.',
      'Doesn\'t connect customer insights across the teams they manage.',
    ],
    yellow: [
      'Some teams have strong customer focus but it\'s not consistent across all.',
      'Shares customer insights across teams but doesn\'t drive unified customer strategy.',
    ],
    green: [
      'Establishes consistent customer research practices across all teams they manage.',
      'Drives cross-team customer journey mapping and ensures holistic user experience.',
    ],
  },

  'Customer Focus::Director': {
    red: [
      'Customer insights don\'t meaningfully influence cross-functional planning.',
      'Doesn\'t establish metrics or processes to track customer satisfaction.',
    ],
    yellow: [
      'Uses customer data in planning but doesn\'t systematically drive customer outcomes.',
      'Advocates for customers in leadership forums but impact is inconsistent.',
    ],
    green: [
      'Makes customer impact a core metric in cross-functional planning and resource allocation.',
      'Drives organizational alignment around customer outcomes with measurable results.',
    ],
  },

  'Customer Focus::Senior Director': {
    red: [
      'Customer strategy is reactive rather than proactive across their scope.',
      'Doesn\'t build organizational capabilities for deep customer understanding.',
    ],
    yellow: [
      'Has a customer strategy but execution is inconsistent across verticals.',
      'Champions customer focus but doesn\'t allocate sufficient resources to research.',
    ],
    green: [
      'Builds and funds a customer research capability that serves the entire organization.',
      'Drives strategic decisions based on deep, cross-vertical customer insights.',
    ],
  },

  'Customer Focus::VP Design': {
    red: [
      'The design org lacks a unified customer research strategy or capability.',
      'Customer focus is treated as a team-level concern, not an organizational priority.',
    ],
    yellow: [
      'Has a customer vision but the design org doesn\'t consistently deliver on it.',
      'Invests in research but insights don\'t consistently influence product strategy.',
    ],
    green: [
      'Design\'s customer insights are a strategic asset that influences company direction.',
      'Has built a research-driven design organization that is the voice of the customer.',
    ],
  },

  // ═══════════════════════════════════════════
  //  OWNERSHIP
  // ═══════════════════════════════════════════

  'Ownership::Product Designer': {
    red: [
      'Waits to be assigned tasks and doesn\'t take initiative on their deliverables.',
      'Drops the ball on follow-through after design handoff.',
    ],
    yellow: [
      'Owns their tasks well but doesn\'t look beyond their immediate responsibilities.',
      'Delivers work on time but doesn\'t proactively flag risks or blockers.',
    ],
    green: [
      'Takes full ownership of their work from problem definition through implementation.',
      'Proactively identifies and communicates risks before they become problems.',
    ],
  },

  'Ownership::Senior Designer': {
    red: [
      'Takes ownership of design but not of the overall outcome for their feature.',
      'Blames other teams when cross-functional collaboration breaks down.',
    ],
    yellow: [
      'Owns their projects end-to-end but doesn\'t extend ownership to adjacent areas.',
      'Takes responsibility for outcomes but doesn\'t proactively improve team processes.',
    ],
    green: [
      'Takes end-to-end ownership including cross-functional alignment and post-launch follow-up.',
      'Proactively improves team processes and fills gaps without being asked.',
    ],
  },

  'Ownership::Staff Designer': {
    red: [
      'Limits ownership to their specific projects rather than the broader design direction.',
      'Doesn\'t step up to own ambiguous cross-team challenges.',
    ],
    yellow: [
      'Owns their vertical\'s design quality but doesn\'t extend to org-level initiatives.',
      'Takes ownership when asked but doesn\'t proactively identify what needs owning.',
    ],
    green: [
      'Owns the design direction for their vertical and ensures quality across all touchpoints.',
      'Proactively identifies ownership gaps across teams and fills them or assigns them.',
    ],
  },

  'Ownership::Senior Staff Designer': {
    red: [
      'Avoids owning controversial or politically complex cross-vertical initiatives.',
      'Takes credit for successes but doesn\'t own failures or learning opportunities.',
    ],
    yellow: [
      'Owns cross-vertical initiatives when assigned but doesn\'t seek them out.',
      'Takes ownership of strategy but doesn\'t ensure execution follows through.',
    ],
    green: [
      'Proactively owns and drives cross-vertical initiatives from strategy through execution.',
      'Takes accountability for outcomes at scale and openly shares learnings from failures.',
    ],
  },

  'Ownership::Principal Designer': {
    red: [
      'Proposes company-wide changes but doesn\'t own the follow-through.',
      'Delegates ownership without ensuring accountability or providing support.',
    ],
    yellow: [
      'Owns company-wide design vision but execution accountability is unclear.',
      'Takes ownership of strategic initiatives but doesn\'t sustain momentum long-term.',
    ],
    green: [
      'Drives company-wide design initiatives from vision through sustained execution.',
      'Creates clear ownership structures that empower others while maintaining accountability.',
    ],
  },

  'Ownership::Lead Product Designer': {
    red: [
      'Micromanages instead of empowering team members to own their work.',
      'Doesn\'t take ownership of team outcomes, only individual contributions.',
    ],
    yellow: [
      'Owns team delivery but doesn\'t instill ownership mentality in team members.',
      'Takes responsibility for team outputs but not for team development.',
    ],
    green: [
      'Builds a culture of ownership where every team member feels accountable for outcomes.',
      'Takes full ownership of team delivery, quality, and professional growth.',
    ],
  },

  'Ownership::Group Design Manager': {
    red: [
      'Allows ownership gaps between teams to persist without resolution.',
      'Takes ownership of successes but deflects responsibility for team failures.',
    ],
    yellow: [
      'Owns cross-team coordination but doesn\'t empower leads to own their domains.',
      'Addresses ownership issues when they cause problems but doesn\'t prevent them.',
    ],
    green: [
      'Creates clear ownership boundaries between teams and addresses gaps proactively.',
      'Empowers leads to own their domains while maintaining accountability for overall results.',
    ],
  },

  'Ownership::Director': {
    red: [
      'Doesn\'t create clear accountability structures across verticals.',
      'Avoids owning difficult cross-functional conflicts or trade-off decisions.',
    ],
    yellow: [
      'Owns outcomes in their area but doesn\'t drive cross-functional accountability.',
      'Creates accountability structures but doesn\'t consistently enforce them.',
    ],
    green: [
      'Creates and maintains clear accountability frameworks across all verticals.',
      'Owns cross-functional outcomes and drives resolution of the hardest trade-off decisions.',
    ],
  },

  'Ownership::Senior Director': {
    red: [
      'Organizational accountability is unclear across the areas they manage.',
      'Doesn\'t model ownership behavior during challenging organizational moments.',
    ],
    yellow: [
      'Takes ownership of strategic direction but execution accountability is loose.',
      'Models ownership but doesn\'t systematically build ownership culture.',
    ],
    green: [
      'Builds an organization where accountability and ownership are cultural norms.',
      'Takes visible ownership during the most challenging moments and leads by example.',
    ],
  },

  'Ownership::VP Design': {
    red: [
      'The design organization lacks clear ownership models for cross-org initiatives.',
      'Doesn\'t personally own and drive the most critical strategic design decisions.',
    ],
    yellow: [
      'Sets ownership expectations but enforcement is inconsistent across the org.',
      'Owns design strategy but doesn\'t drive accountability for outcomes company-wide.',
    ],
    green: [
      'Has built a design organization with exemplary ownership culture at every level.',
      'Personally owns the most important cross-organizational design decisions and outcomes.',
    ],
  },

  // ═══════════════════════════════════════════
  //  CRAFT EXCELLENCE (IC)
  // ═══════════════════════════════════════════

  'Craft Excellence::Product Designer': {
    red: [
      'Delivers work with inconsistent quality — misses details in spacing, alignment, or hierarchy.',
      'Doesn\'t apply or follow the design system consistently.',
    ],
    yellow: [
      'Produces clean work but doesn\'t push beyond established patterns.',
      'Follows the design system well but doesn\'t contribute to improving it.',
    ],
    green: [
      'Delivers pixel-perfect work with strong attention to detail and visual hierarchy.',
      'Actively contributes to the design system and raises the bar for team quality.',
    ],
  },

  'Craft Excellence::Senior Designer': {
    red: [
      'Craft quality is inconsistent and requires regular review from peers.',
      'Doesn\'t set or enforce quality standards for the work they influence.',
    ],
    yellow: [
      'Maintains high personal craft standards but doesn\'t elevate others\' quality.',
      'Produces excellent work but doesn\'t innovate on patterns or approaches.',
    ],
    green: [
      'Consistently raises the craft bar and actively elevates the team\'s design quality.',
      'Innovates on design patterns while maintaining coherence with the design system.',
    ],
  },

  'Craft Excellence::Staff Designer': {
    red: [
      'Focuses on strategy at the expense of maintaining high craft standards.',
      'Design systems and patterns they establish lack the quality to serve as standards.',
    ],
    yellow: [
      'Maintains personal craft excellence but doesn\'t scale it through systems and standards.',
      'Creates good design standards but they\'re not adopted consistently across teams.',
    ],
    green: [
      'Defines and scales craft standards through design systems that teams actually adopt.',
      'Balances strategic impact with hands-on craft that inspires and guides the team.',
    ],
  },

  'Craft Excellence::Senior Staff Designer': {
    red: [
      'Has become too removed from craft to set credible quality standards.',
      'Doesn\'t ensure craft excellence is maintained across the verticals they influence.',
    ],
    yellow: [
      'Maintains awareness of craft quality but doesn\'t actively drive improvement at scale.',
      'Sets high standards but lacks mechanisms to ensure consistent execution.',
    ],
    green: [
      'Drives craft excellence at scale through systems, standards, and mentorship.',
      'Ensures cross-vertical design coherence while allowing teams appropriate creative freedom.',
    ],
  },

  'Craft Excellence::Principal Designer': {
    red: [
      'Craft excellence is not a visible priority in the vision they set.',
      'Doesn\'t engage enough with actual design work to credibly guide craft direction.',
    ],
    yellow: [
      'Champions craft in principle but doesn\'t invest enough in the systems that sustain it.',
      'Sets a high bar personally but the org struggles to consistently meet it.',
    ],
    green: [
      'Sets a company-wide vision for craft excellence and invests in the systems to achieve it.',
      'Remains connected enough to the craft to guide it credibly and inspire the organization.',
    ],
  },

  // ═══════════════════════════════════════════
  //  COMMUNICATION (IC)
  // ═══════════════════════════════════════════

  'Communication::Product Designer': {
    red: [
      'Struggles to articulate design rationale clearly in reviews or stakeholder meetings.',
      'Documentation is incomplete or hard for others to follow.',
    ],
    yellow: [
      'Communicates clearly with their direct team but not yet with broader stakeholders.',
      'Presents design decisions well but doesn\'t tailor the message to the audience.',
    ],
    green: [
      'Articulates design rationale clearly and tailors communication to different audiences.',
      'Creates comprehensive documentation that enables smooth handoff and collaboration.',
    ],
  },

  'Communication::Senior Designer': {
    red: [
      'Design presentations lack clear narrative structure or persuasive framing.',
      'Doesn\'t proactively communicate project status, risks, or decisions to stakeholders.',
    ],
    yellow: [
      'Communicates well in familiar settings but struggles in high-stakes presentations.',
      'Shares updates regularly but doesn\'t always frame them in terms of business impact.',
    ],
    green: [
      'Tells compelling design stories that win stakeholder buy-in and drive alignment.',
      'Proactively communicates status, risks, and decisions with appropriate context and framing.',
    ],
  },

  'Communication::Staff Designer': {
    red: [
      'Doesn\'t effectively communicate design direction to influence teams without direct authority.',
      'Communication doesn\'t scale — relies on 1:1 conversations for alignment.',
    ],
    yellow: [
      'Communicates effectively with peers but struggles to influence senior leadership.',
      'Creates good artifacts but doesn\'t create systems for scalable communication.',
    ],
    green: [
      'Influences teams and leaders through clear, scalable communication artifacts and narratives.',
      'Builds shared understanding across multiple teams through effective storytelling and documentation.',
    ],
  },

  'Communication::Senior Staff Designer': {
    red: [
      'Communication doesn\'t bridge the gap between design strategy and executive understanding.',
      'Doesn\'t adapt communication style when working across different organizational cultures.',
    ],
    yellow: [
      'Communicates strategy clearly but doesn\'t always ensure understanding and buy-in.',
      'Effective communicator but doesn\'t mentor others in communication skills.',
    ],
    green: [
      'Translates complex cross-vertical design strategy into clear, actionable narratives for any audience.',
      'Mentors senior ICs and leads in executive communication and stakeholder management.',
    ],
  },

  'Communication::Principal Designer': {
    red: [
      'Company-wide vision isn\'t communicated in ways that inspire action across teams.',
      'Doesn\'t build the communication channels needed to sustain organizational alignment.',
    ],
    yellow: [
      'Articulates vision well but follow-up communication is inconsistent.',
      'Communicates effectively 1:1 but struggles with organizational-scale messaging.',
    ],
    green: [
      'Communicates a compelling design vision that inspires and aligns the entire organization.',
      'Builds communication systems and rituals that sustain alignment as the org scales.',
    ],
  },

  // ═══════════════════════════════════════════
  //  COLLABORATION (IC)
  // ═══════════════════════════════════════════

  'Collaboration::Product Designer': {
    red: [
      'Works in isolation and shares work only when it\'s "ready," missing early feedback.',
      'Struggles to collaborate effectively with engineers or product managers.',
    ],
    yellow: [
      'Collaborates well when structured but doesn\'t initiate cross-functional partnerships.',
      'Works with immediate team but doesn\'t seek input from adjacent teams.',
    ],
    green: [
      'Proactively partners with engineers and PMs from problem definition through implementation.',
      'Seeks diverse perspectives and incorporates feedback to strengthen design outcomes.',
    ],
  },

  'Collaboration::Senior Designer': {
    red: [
      'Dominates design discussions rather than facilitating inclusive collaboration.',
      'Doesn\'t invest in relationships with cross-functional partners beyond immediate needs.',
    ],
    yellow: [
      'Collaborates effectively but doesn\'t proactively create opportunities for collaboration.',
      'Partners well with familiar teammates but doesn\'t extend to new or adjacent teams.',
    ],
    green: [
      'Creates and facilitates collaborative rituals that improve cross-functional outcomes.',
      'Builds strong partnerships across functions that extend beyond immediate project needs.',
    ],
  },

  'Collaboration::Staff Designer': {
    red: [
      'Operates as a lone strategist rather than building coalition for design initiatives.',
      'Doesn\'t model collaborative behavior for the teams they influence.',
    ],
    yellow: [
      'Collaborates with peers effectively but doesn\'t systematically improve team collaboration.',
      'Builds coalitions when needed but doesn\'t maintain them long-term.',
    ],
    green: [
      'Builds and maintains collaborative relationships across multiple teams and functions.',
      'Models and institutionalizes collaborative practices that improve how teams work together.',
    ],
  },

  'Collaboration::Senior Staff Designer': {
    red: [
      'Drives initiatives unilaterally without building genuine cross-vertical collaboration.',
      'Doesn\'t invest in the relationships needed to drive change across the organization.',
    ],
    yellow: [
      'Collaborates well within design but doesn\'t extend to cross-functional senior leadership.',
      'Builds alignment but doesn\'t maintain collaborative momentum through execution.',
    ],
    green: [
      'Builds deep cross-functional partnerships at senior levels that drive strategic alignment.',
      'Creates collaborative forums that bring together diverse perspectives across verticals.',
    ],
  },

  'Collaboration::Principal Designer': {
    red: [
      'Works in an ivory tower — ideas don\'t reflect input from across the organization.',
      'Doesn\'t build the collaborative infrastructure needed for company-wide initiatives.',
    ],
    yellow: [
      'Collaborates with key leaders but doesn\'t create systemic collaboration channels.',
      'Seeks input from some areas but misses important perspectives.',
    ],
    green: [
      'Creates collaborative structures that enable the organization to tackle its biggest challenges.',
      'Builds executive-level partnerships that position design as a strategic collaborator.',
    ],
  },

  // ═══════════════════════════════════════════
  //  DRIVES HIGH PERFORMANCE (Manager)
  // ═══════════════════════════════════════════

  'Drives High Performance::Lead Product Designer': {
    red: [
      'Doesn\'t set clear expectations or hold the team accountable for quality.',
      'Avoids performance conversations and lets underperformance persist.',
    ],
    yellow: [
      'Sets expectations but doesn\'t consistently follow up on performance gaps.',
      'Addresses performance issues when they become critical but not proactively.',
    ],
    green: [
      'Sets clear, inspiring expectations and creates an environment where excellence is the norm.',
      'Addresses performance issues promptly and constructively, driving continuous improvement.',
    ],
  },

  'Drives High Performance::Group Design Manager': {
    red: [
      'Performance standards vary widely across the teams they manage.',
      'Doesn\'t calibrate performance expectations across leads.',
    ],
    yellow: [
      'Drives performance in familiar teams but struggles with newly inherited ones.',
      'Sets standards but doesn\'t provide leads with the tools to drive performance.',
    ],
    green: [
      'Creates consistent high-performance culture across all teams through calibrated standards.',
      'Equips leads with frameworks and coaching to drive performance independently.',
    ],
  },

  'Drives High Performance::Director': {
    red: [
      'High performance is aspirational rather than systematically driven.',
      'Doesn\'t create the incentive structures or systems that sustain high performance.',
    ],
    yellow: [
      'Drives performance within design but doesn\'t influence cross-functional performance.',
      'Sets high standards but doesn\'t invest enough in the systems to sustain them.',
    ],
    green: [
      'Builds performance systems — reviews, calibration, recognition — that sustain excellence.',
      'Drives cross-functional performance by setting high standards for design collaboration.',
    ],
  },

  'Drives High Performance::Senior Director': {
    red: [
      'Performance culture is inconsistent across the large org they oversee.',
      'Tolerates mediocrity in some areas while pushing for excellence in others.',
    ],
    yellow: [
      'Has high performance pockets but hasn\'t scaled the culture org-wide.',
      'Drives performance through personal involvement rather than systemic change.',
    ],
    green: [
      'Has built an organization-wide performance culture with consistent standards and recognition.',
      'Performance systems work independently of their personal involvement.',
    ],
  },

  'Drives High Performance::VP Design': {
    red: [
      'The design org is not known for high performance relative to peer functions.',
      'Doesn\'t invest in the talent and systems needed to drive organizational performance.',
    ],
    yellow: [
      'Some parts of the org perform exceptionally while others lag behind.',
      'Drives performance but hasn\'t built it into the organizational DNA.',
    ],
    green: [
      'Has built a design organization that is widely recognized for exceptional performance.',
      'Performance culture is self-sustaining and attracts top talent.',
    ],
  },

  // ═══════════════════════════════════════════
  //  DEVELOPS TALENT (Manager)
  // ═══════════════════════════════════════════

  'Develops Talent::Lead Product Designer': {
    red: [
      'Doesn\'t invest time in 1:1s, coaching, or career development conversations.',
      'Team members lack clarity on their growth path or development areas.',
    ],
    yellow: [
      'Has regular 1:1s but they focus on project updates rather than development.',
      'Supports growth when team members ask but doesn\'t proactively identify opportunities.',
    ],
    green: [
      'Creates personalized development plans and provides regular, actionable feedback.',
      'Proactively identifies stretch opportunities and coaches team members through challenges.',
    ],
  },

  'Develops Talent::Group Design Manager': {
    red: [
      'Doesn\'t develop leads or create leadership pipeline for the organization.',
      'Talent development is ad hoc and inconsistent across teams.',
    ],
    yellow: [
      'Develops direct reports well but doesn\'t ensure skip-level talent development.',
      'Has some talent development practices but they\'re not systematic.',
    ],
    green: [
      'Builds a systematic talent development program that creates strong leaders at every level.',
      'Ensures consistent talent development across all teams, including skip-level mentorship.',
    ],
  },

  'Develops Talent::Director': {
    red: [
      'The design organization has significant talent gaps with no plan to address them.',
      'Doesn\'t invest in talent development as a strategic priority.',
    ],
    yellow: [
      'Develops senior talent well but the broader pipeline needs more investment.',
      'Has talent development goals but execution is inconsistent.',
    ],
    green: [
      'Has built a robust talent pipeline with clear career paths and development programs.',
      'Talent development is a strategic priority with dedicated resources and measured outcomes.',
    ],
  },

  'Develops Talent::Senior Director': {
    red: [
      'Leadership bench strength is weak across the org they manage.',
      'Doesn\'t create the conditions for talent to grow across organizational boundaries.',
    ],
    yellow: [
      'Develops some strong leaders but talent development is uneven across the org.',
      'Invests in talent but doesn\'t create mobility opportunities across teams.',
    ],
    green: [
      'Has built deep leadership bench strength with succession plans for every key role.',
      'Creates talent mobility across teams and develops leaders who develop other leaders.',
    ],
  },

  'Develops Talent::VP Design': {
    red: [
      'The design org struggles to retain top talent or develop future leaders.',
      'Talent strategy is reactive — filling roles rather than building capabilities.',
    ],
    yellow: [
      'Attracts good talent but retention and development programs need improvement.',
      'Has a talent vision but it\'s not yet fully embedded in organizational practices.',
    ],
    green: [
      'The design org is known as a place where careers are made and talent thrives.',
      'Has built a talent ecosystem — hiring, development, retention — that is a competitive advantage.',
    ],
  },

  // ═══════════════════════════════════════════
  //  EXECUTION & IMPACT (Manager)
  // ═══════════════════════════════════════════

  'Execution & Impact::Lead Product Designer': {
    red: [
      'Team consistently misses deadlines or delivers work that doesn\'t meet expectations.',
      'Doesn\'t connect team output to measurable business or user outcomes.',
    ],
    yellow: [
      'Team delivers on time but impact isn\'t always clearly demonstrated.',
      'Executes well on defined work but doesn\'t push for higher-impact opportunities.',
    ],
    green: [
      'Team consistently delivers high-quality work on time with measurable impact.',
      'Identifies and pursues the highest-impact opportunities, not just assigned work.',
    ],
  },

  'Execution & Impact::Group Design Manager': {
    red: [
      'Execution quality and impact vary widely across the teams they manage.',
      'Doesn\'t create systems for tracking or improving execution across teams.',
    ],
    yellow: [
      'Teams execute well but impact measurement is inconsistent.',
      'Drives execution on planned work but misses emerging high-impact opportunities.',
    ],
    green: [
      'Creates execution systems that ensure consistent, high-impact delivery across all teams.',
      'Identifies and allocates resources to the highest-impact opportunities across their scope.',
    ],
  },

  'Execution & Impact::Director': {
    red: [
      'Design\'s impact on business outcomes is unclear or unmeasured.',
      'Execution processes don\'t scale and create bottlenecks.',
    ],
    yellow: [
      'Demonstrates design impact but can\'t consistently prove ROI to leadership.',
      'Execution is strong but not optimized for efficiency at scale.',
    ],
    green: [
      'Has built execution frameworks that consistently deliver measurable business impact.',
      'Can clearly demonstrate design ROI and uses it to secure resources and influence.',
    ],
  },

  'Execution & Impact::Senior Director': {
    red: [
      'Impact of design across the broad org is hard to quantify or communicate.',
      'Execution model doesn\'t scale with organizational growth.',
    ],
    yellow: [
      'Delivers strong impact in core areas but emerging areas are underinvested.',
      'Has impact metrics but they don\'t fully capture design\'s strategic contribution.',
    ],
    green: [
      'Has a clear, measurable framework for design impact that influences resource allocation.',
      'Execution model scales effectively and consistently delivers strategic outcomes.',
    ],
  },

  'Execution & Impact::VP Design': {
    red: [
      'Design is not seen as a significant driver of business results by the executive team.',
      'Execution model is a bottleneck rather than an enabler for the company.',
    ],
    yellow: [
      'Design impact is recognized but not yet fully integrated into business strategy.',
      'Has strong execution but ROI story could be more compelling.',
    ],
    green: [
      'Design is widely recognized as a strategic driver of business outcomes and competitive advantage.',
      'Has built an execution model that consistently delivers outsized impact relative to investment.',
    ],
  },
};

export function getExampleKey(focusArea: string, role: string): string {
  return `${focusArea}::${role}`;
}

export function getDefaultExamples(focusArea: string, role: string): TrafficLightExamples {
  const key = getExampleKey(focusArea, role);
  return DEFAULT_LADDER_EXAMPLES[key] || { red: [''], yellow: [''], green: [''] };
}
