export interface TrafficLightExamples {
  expectations: string[];
  red: string[];
  yellow: string[];
  green: string[];
  framing?: string;
}

// Key format: "focusArea::role"
// Role names match the IC-Mapping.csv: Product Designer, Senior Designer, Staff Designer, Senior Staff Designer, Principal Designer
export const DEFAULT_LADDER_EXAMPLES: Record<string, TrafficLightExamples> = {

  // ═══════════════════════════════════════════
  //  PROBLEM SOLVING
  // ═══════════════════════════════════════════

  'Problem Solving::Product Designer': {
    framing: 'As a Product Designer it is expected that you\'re building your problem-solving foundations. You\'re learning to connect your design work to user needs and business goals, and beginning to question default solutions rather than accepting the first obvious answer.',
    expectations: [
      'Align your work with broader strategy and articulate how it supports user needs and business goals',
      'Connect your day-to-day design decisions to the strategic intent behind the work',
      'Explore multiple approaches before settling on a direction rather than defaulting to the obvious solution',
      'Question assumptions in your brief and bring fresh perspectives to the problem',
      'Articulate clearly what problem you are solving and why it matters to the user',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Problem Solving::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you operate independently on problem framing and help your team stay focused on the right challenges. You use insight to guide prioritisation and can reframe problems to open up better solutions.',
    expectations: [
      'Clarify the problem space and help the team focus on the most meaningful opportunities',
      'Translate user and business insights into clear problem framing',
      'Reframe challenges to introduce fresh perspectives and challenge conventional thinking',
      'Use insights to influence which problems the team prioritises',
      'Demonstrate multiple approaches and articulate the trade-offs between them',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Problem Solving::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you influence the strategy of your vertical through strong problem definition. You use design vision, narratives, and experience principles to shape direction and uncover opportunity spaces that others haven\'t yet seen.',
    expectations: [
      'Define the design direction and strategic approach for your vertical',
      'Shape strategic conversations using insights, design vision, and experience principles',
      'Unlock new opportunities by reframing complex problem spaces',
      'Imagine alternative models, workflows, or experiences that challenge the status quo',
      'Influence cross-functional prioritisation by bringing a clear, evidence-backed point of view on the problem',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Problem Solving::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you co-create strategy across verticals. You shape long-term experience vision and organisational priorities through customer insight and a compelling design-led narrative. You identify high-leverage problems others overlook.',
    expectations: [
      'Co-create design direction and long-term experience vision across multiple verticals',
      'Identify high-leverage problems that others may overlook',
      'Set new paradigms for problem framing and creative thinking across the organisation',
      'Use storytelling and compelling narrative to influence organisational priorities',
      'Ensure design meaningfully influences long-term business strategy',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Problem Solving::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you define the company-wide experience vision and set the standard for how the organisation identifies and frames problems. You see what others cannot yet see and establish new ways of thinking that elevate the entire design function.',
    expectations: [
      'Define and champion the company-wide experience vision',
      'Identify paradigm-shifting problems and reframe them in ways that unlock strategic value',
      'Establish new standards for problem framing that the whole organisation adopts',
      'Shape long-term business strategy through design-led thinking and insight',
      'Mentor Senior Staff and Staff designers on strategic problem definition and vision-setting',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  // ═══════════════════════════════════════════
  //  ADAPTABILITY
  // ═══════════════════════════════════════════

  'Adaptability::Product Designer': {
    framing: 'As a Product Designer it is expected that you\'re building the habits of an adaptable designer. You align with Deel values, contribute to team culture, and show curiosity by experimenting with new ideas, tools, and approaches — including AI — to improve your work.',
    expectations: [
      'Align with Deel values and apply them consistently in your day-to-day work',
      'Participate actively in team rituals, critiques, and shared practices',
      'Show curiosity by experimenting with new ideas, inspiration, and tools including AI',
      'Respond constructively when priorities shift and seek guidance on how to adjust',
      'Reflect openly on what\'s working and what isn\'t in your approach',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Adaptability::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you reinforce Deel values through your decisions and help shape and evolve team culture. You respond to shifting priorities with minimal supervision and apply new tools or approaches where they genuinely improve how the team works.',
    expectations: [
      'Reinforce Deel values consistently through your decisions and how you collaborate',
      'Actively help shape, maintain, and evolve team rituals, norms, and ways of working',
      'Apply new tools or technologies where they meaningfully improve team output',
      'Respond effectively to shifting priorities with minimal supervision',
      'Share what you\'ve learned from experiments with the wider team',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Adaptability::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you shape design org culture within your vertical. You identify cultural gaps, invest in coaching others, and turn successful experiments into repeatable approaches. You thrive in ambiguous or rapidly changing contexts.',
    expectations: [
      'Drive initiatives that improve how designers in your vertical work and grow',
      'Identify cultural gaps across teams and lead efforts to address them',
      'Invest consistent time in coaching and supporting designers',
      'Turn successful experiments into repeatable approaches others can build on',
      'Thrive in ambiguous or rapidly evolving contexts and help others do the same',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Adaptability::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you shape design org culture across your vertical and influence how teams adapt and evolve their practices. You drive ongoing cultural initiatives and ensure the lessons from experimentation are embedded into how teams operate.',
    expectations: [
      'Shape design org culture across your vertical through deliberate, sustained effort',
      'Lead cultural initiatives that address gaps and improve how designers work',
      'Influence how teams adapt and evolve their practices through consistent example',
      'Ensure successful experiments become embedded practice rather than one-off wins',
      'Coach designers to thrive in ambiguity rather than wait for clarity',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Adaptability::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you define the long-term design org culture alongside design leaders. You embed adaptability, experimentation, and learning into how the organisation operates at every level — from hiring through to leadership expectations.',
    expectations: [
      'Define and evolve the long-term design org culture alongside design leadership',
      'Embed culture into hiring, progression, recognition, and leadership expectations',
      'Build a culture where experimentation, learning, and reimagining the possible are core to how design operates',
      'Evolve culture across domains as the organisation scales and changes',
      'Model adaptability at the highest level, demonstrating how to lead through uncertainty',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  // ═══════════════════════════════════════════
  //  CUSTOMER FOCUS
  // ═══════════════════════════════════════════

  'Customer Focus::Product Designer': {
    framing: 'As a Product Designer it is expected that you\'re developing your customer empathy foundations. You engage regularly with the product, conduct basic research with guidance, and ground your design decisions in real user needs rather than assumptions.',
    expectations: [
      'Build customer empathy by regularly dogfooding the product and engaging with user feedback',
      'Conduct basic user research with guidance — usability tests, interviews, competitor reviews',
      'Identify pain points and edge cases by thinking through user workflows',
      'Reference customer insights shared by the team to inform your design decisions',
      'Ground your decisions in user needs rather than assumption or personal preference',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Customer Focus::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you plan and conduct user research independently and act as the voice of the customer within your product team. You dogfood end-to-end, advocate for user needs in prioritisation discussions, and develop a real understanding of your customer segments.',
    expectations: [
      'Plan and conduct user research independently including usability testing, interviews, and competitor analysis',
      'Act as the voice of the customer in prioritisation and trade-off discussions',
      'Dogfood the product end-to-end to surface quality issues and friction points before they reach customers',
      'Develop a working understanding of your customer segments and their distinct needs',
      'Ensure your design decisions are evidence-based, not assumption-based',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Customer Focus::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you establish user research and customer insight practices within your vertical. You ensure empathy and evidence are embedded from problem framing through delivery, and you coach others to do the same.',
    expectations: [
      'Establish user research and customer insight practices within your vertical',
      'Drive competitor and market analysis that shapes design direction and strategic priorities',
      'Define dogfooding rituals and feedback loops that surface issues early and raise experience quality',
      'Coach designers on research methods and ensure the voice of the customer reaches cross-functional decisions',
      'Ensure empathy and evidence are embedded from problem framing all the way through to delivery',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Customer Focus::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you champion customer insight practices across your vertical, ensure the voice of the customer is represented in all key decisions, and build the feedback loops that keep quality high at scale.',
    expectations: [
      'Champion customer insight practices across your vertical and adjacent teams',
      'Ensure the voice of the customer is represented in high-stakes cross-functional decisions',
      'Build feedback loops and dogfooding rituals that surface issues early across teams',
      'Coach designers on research methods and customer-centered decision-making',
      'Use market and competitor analysis to shape design direction at a vertical level',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Customer Focus::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you define the company-wide approach to customer insight. You set the standard for dogfooding culture, pioneer new research methodologies, and elevate Deel\'s reputation for customer-centricity through evidence-driven advocacy and external thought leadership.',
    expectations: [
      'Define the company-wide approach to customer insight, research, and voice-of-the-customer practices',
      'Set the standard for dogfooding culture and quality control at scale',
      'Pioneer new research methodologies and frameworks that deepen understanding of customer needs',
      'Advocate for customer-centricity at the executive level and through external thought leadership',
      'Build systems that connect customer feedback directly to design and product priorities across all verticals',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  // ═══════════════════════════════════════════
  //  OWNERSHIP
  // ═══════════════════════════════════════════

  'Ownership::Product Designer': {
    framing: 'As a Product Designer it is expected that you deliver your assigned work reliably, take responsibility for your own output, and proactively flag blockers or risks rather than waiting to be asked.',
    expectations: [
      'Deliver assigned tasks reliably, meeting expectations for quality and timelines',
      'Take responsibility for your own work and follow through on feedback',
      'Proactively flag blockers, risks, or issues as they arise',
      'Seek guidance when needed rather than staying stuck',
      'Demonstrate personal accountability within your defined scope',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Ownership::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you own projects end-to-end, from problem understanding through delivery and iteration. You manage dependencies, take responsibility for outcomes post-launch, and proactively identify challenges and opportunities within your scope.',
    expectations: [
      'Own projects end-to-end from problem understanding through delivery and iteration',
      'Identify challenges and opportunities within your scope and raise them proactively',
      'Manage dependencies and coordinate with partners to keep work moving',
      'Take responsibility for outcomes post-launch and learn from the impact of your work',
      'Demonstrate accountability for quality as well as delivery',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Ownership::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you lead problem spaces within your vertical, set direction, and take accountability for progress and outcomes across teams. You anticipate challenges before they materialise and make prioritisation decisions that unblock others.',
    expectations: [
      'Lead problem spaces within your vertical, setting direction and defining what success looks like',
      'Anticipate challenges and opportunities ahead of time, creating clarity before issues materialise',
      'Make prioritisation and trade-off decisions that unblock teams and maintain momentum',
      'Take accountability for progress and outcomes across teams, not just your own work',
      'Define success metrics and check in on impact after delivery',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Ownership::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you drive company-level outcomes related to experience and customer impact. You steer initiatives across multiple verticals, make high-judgement calls in ambiguous situations, and set the standard for ownership and accountability.',
    expectations: [
      'Drive company-level outcomes related to experience and customer impact',
      'Steer initiatives across multiple verticals, aligning teams around shared outcomes',
      'Make high-judgement calls in ambiguous situations, balancing speed, quality, and impact',
      'Set the standard for ownership, accountability, and agency across the organisation',
      'Anticipate long-term risks and shape direction before problems surface',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Ownership::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you set the highest standard of ownership in the organisation. You anticipate long-term risks, shape direction before problems surface, and take personal accountability for the health of the design function and its impact on the business.',
    expectations: [
      'Set the standard for ownership, accountability, and agency across Deel Design',
      'Anticipate long-term risks and shape direction well before problems surface',
      'Drive company-level outcomes and take accountability for their success',
      'Make high-judgement calls that balance long-term vision with near-term business needs',
      'Model ownership behaviours that others aspire to and explicitly coach others on accountability',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  // ═══════════════════════════════════════════
  //  CRAFT EXCELLENCE
  // ═══════════════════════════════════════════

  'Craft Excellence::Product Designer': {
    framing: 'As a Product Designer it is expected that you apply craft standards consistently by following established patterns, guidelines, and systems. You deliver clean, production-ready work and actively strengthen your core craft skills through execution and feedback.',
    expectations: [
      'Apply craft standards by following established patterns, guidelines, and systems',
      'Deliver clear, detailed, production-ready work',
      'Produce work that meets established standards and incorporate feedback to improve',
      'Strengthen your core craft skills through consistent execution',
      'Cover interaction design, visual design, and accessibility in your work — not just the happy path',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Craft Excellence::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you demonstrate mastery and elevate craft standards in practice. You raise the quality bar within your team through critique, feedback, and hands-on examples, and you balance speed and quality with good judgement.',
    expectations: [
      'Demonstrate mastery of craft and raise the quality of execution within your team',
      'Improve consistency and quality through critique, feedback, and hands-on examples',
      'Balance speed and quality, knowing when to polish and when to ship to learn',
      'Model high-quality craft in a way that others can learn from and reference',
      'Hold a high bar for accessibility, interaction, and visual quality in your own work and in reviews',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Craft Excellence::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you codify craft standards for your vertical. You formalise patterns, quality expectations, and reusable approaches that emerge from practice, and you mentor designers to apply them consistently.',
    expectations: [
      'Codify craft standards for your vertical — patterns, quality expectations, and reusable approaches',
      'Ensure coherence across the vertical, reducing fragmentation and inconsistencies between teams',
      'Turn implicit good design into explicit guidelines others can apply',
      'Mentor designers to consistently apply high-quality craft',
      'Evidence the impact of raising craft standards on the quality of shipped product',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Craft Excellence::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you envision the long-term craft direction for Deel Design. You define and evolve design standards that improve accuracy, consistency, and quality at scale, and co-define craft philosophy across the design org.',
    expectations: [
      'Envision the long-term craft direction for Deel Design',
      'Define and evolve design standards that improve accuracy, consistency, and quality at scale',
      'Co-define craft philosophy across Deel Design and establish craft governance',
      'Set the bar for design excellence at an industry level',
      'Represent Deel as a recognised craft leader internally and externally',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Craft Excellence::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you set the bar for design excellence at an industry level. You shape Deel\'s design identity, establish and maintain craft governance, and ensure that craft standards are a point of competitive advantage for the business.',
    expectations: [
      'Set the bar for design excellence at an industry level and represent Deel as a craft leader',
      'Shape Deel\'s design identity through long-term craft vision and clear standards',
      'Establish and maintain craft governance across Deel Design',
      'Ensure craft quality is a strategic asset and point of competitive advantage',
      'Influence how craft is understood and valued at the executive and business level',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  // ═══════════════════════════════════════════
  //  COMMUNICATION
  // ═══════════════════════════════════════════

  'Communication::Product Designer': {
    framing: 'As a Product Designer it is expected that you communicate clearly within your immediate team — both verbally and in writing. You explain your design decisions with clear intent and rationale, and you seek support when facing more complex or high-stakes communication.',
    expectations: [
      'Communicate clearly within your immediate team, verbally and in writing',
      'Explain design decisions using shared artifacts and clear rationale',
      'Articulate the intent behind your design choices, not just what you made',
      'Seek support or preparation when facing complex or high-stakes communication',
      'Listen actively and incorporate feedback into your next communication',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Communication::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you clearly explain design decisions and trade-offs across Product, Engineering, and adjacent functions. You tailor your communication to your audience, manage expectations within your area, and use storytelling and workshops to help teams align.',
    expectations: [
      'Clearly explain design decisions and trade-offs to support shared understanding across functions',
      'Use storytelling, critique, and workshops to help the team align and move forward',
      'Tailor your explanations to the audience and context',
      'Manage expectations effectively within your area of ownership',
      'Demonstrate the ability to communicate complex ideas simply and without jargon',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Communication::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you influence alignment across your vertical through clear narrative. You manage stakeholders across teams with minimal oversight, coach designers on communication, and shape shared understanding through compelling design narratives.',
    expectations: [
      'Influence alignment across your vertical through clear, compelling narrative',
      'Manage stakeholders across teams with minimal oversight',
      'Coach designers on communication and stakeholder management',
      'Shape shared understanding by connecting design choices to user impact and business outcomes',
      'Be known as a clear, credible, and reliable communicator across functions',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Communication::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you lead complex, high-stakes conversations that drive alignment across teams and disciplines. You communicate with authority in high-ambiguity contexts and use narrative strategically to navigate tension and enable high-quality decisions.',
    expectations: [
      'Lead complex, high-stakes conversations that drive alignment across teams and disciplines',
      'Align senior stakeholders through compelling storytelling and clear points of view',
      'Communicate with authority in high-ambiguity contexts',
      'Use narrative strategically to navigate tension and enable high-quality decisions',
      'Elevate the communication bar across Deel Design',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Communication::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you set the communication standard for the entire design org. You align executives through authoritative storytelling, navigate the most complex and politically charged conversations, and ensure Deel Design speaks with one clear, credible voice.',
    expectations: [
      'Set the communication standard for Deel Design and actively elevate it across the org',
      'Align executives and senior leadership through authoritative and compelling storytelling',
      'Navigate the most complex and politically charged conversations with clarity and confidence',
      'Ensure Deel Design communicates with a coherent, credible voice across all contexts',
      'Coach senior designers on executive communication and high-stakes narrative',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  // ═══════════════════════════════════════════
  //  COLLABORATION
  // ═══════════════════════════════════════════

  'Collaboration::Product Designer': {
    framing: 'As a Product Designer it is expected that you collaborate openly with other designers in your vertical, participate constructively in critiques and working sessions, and build positive relationships by taking ownership and working well with others.',
    expectations: [
      'Collaborate openly with other designers in your vertical in critiques and working sessions',
      'Seek and provide feedback constructively within your immediate team',
      'Build positive relationships by taking ownership of issues and working generously with others',
      'Contribute to a team environment where feedback is welcomed and acted on',
      'Show up reliably and consistently as a collaborative teammate',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Collaboration::Senior Designer': {
    framing: 'As a Senior Product Designer it is expected that you facilitate collaboration within your cross-functional team, help discussions stay focused and productive, and proactively seek and provide feedback to strengthen shared outcomes.',
    expectations: [
      'Facilitate collaboration within your cross-functional team, keeping discussions focused and productive',
      'Build shared understanding across Product, Engineering, and adjacent functions',
      'Proactively seek and provide feedback to strengthen team outcomes',
      'Help resolve friction between team members or functions constructively',
      'Be known as a reliable, generous collaborator who makes the work better',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Collaboration::Staff Designer': {
    framing: 'As a Staff Product Designer it is expected that you drive effective cross-team collaboration within your vertical. You establish norms for how designers and cross-functional partners work together and strengthen relationships that enhance quality and delivery.',
    expectations: [
      'Drive effective cross-team collaboration within your vertical',
      'Establish norms for how designers and cross-functional partners work together',
      'Strengthen relationships across teams to enhance quality and delivery',
      'Foster alignment and shared ownership across your vertical',
      'Model the collaborative behaviours you want to see from the teams around you',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Collaboration::Senior Staff Designer': {
    framing: 'As a Senior Staff Product Designer it is expected that you drive effective cross-team collaboration across your vertical and beyond. You establish the norms and systems that enable great partnership, and you strengthen relationships at scale.',
    expectations: [
      'Drive effective cross-team collaboration across your vertical and into adjacent teams',
      'Establish the norms and systems that enable great cross-functional partnership',
      'Strengthen relationships at scale to enhance quality and delivery across the organisation',
      'Identify and address collaboration breakdowns before they become blockers',
      'Be known as a connector who builds bridges between teams, disciplines, and geographies',
    ],
    red: [],
    yellow: [],
    green: [],
  },

  'Collaboration::Principal Designer': {
    framing: 'As a Principal Designer it is expected that you set the standard for collaboration across Deel Design and cross-functionally. You orchestrate collaboration across verticals, build the systems and practices that enable effective cross-team partnership, and create a culture of seamless collaboration at every level.',
    expectations: [
      'Set the standard for collaboration across Deel Design and cross-functionally',
      'Orchestrate collaboration across verticals, building systems and practices for effective partnership',
      'Create the structures and culture that enable seamless partnership across teams, functions, and geographies',
      'Embed collaboration norms into how the design org hires, onboards, and develops designers',
      'Be the exemplar of generous, high-trust collaboration that others look to as the benchmark',
    ],
    red: [],
    yellow: [],
    green: [],
  },
};

export function getExampleKey(focusArea: string, role: string): string {
  return `${focusArea}::${role}`;
}

export function getDefaultExamples(focusArea: string, role: string): TrafficLightExamples {
  const key = getExampleKey(focusArea, role);
  return DEFAULT_LADDER_EXAMPLES[key] || { expectations: [], red: [''], yellow: [''], green: [''] };
}
