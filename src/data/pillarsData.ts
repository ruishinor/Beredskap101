/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pillar, Scenario, ChecklistGroup } from '../types';

// ============================================================================
// ENGLISH SYSTEM DATA (NORMALIZED DEFAULT BASELINE)
// ============================================================================

export const pillarsDataEn: Pillar[] = [
  {
    id: 'førstehjelp',
    title: 'First Aid & Trauma Care',
    titleEnglish: 'First Aid & Trauma Care',
    iconName: 'HeartPulse',
    shortDescription: 'Practical medical guidance designed to save lives when professional rescue is delayed.',
    philosophy: 'Evidence-based, immediately actionable medical guidance for extreme real-world stressors.',
    topics: [
      {
        id: 'heat-stroke-protocol',
        title: 'Heat Stroke: Identification and Treatment',
        shortSummary: 'How to recognize and treat life-threatening hyperthermia under extreme temperature conditions.',
        situationContext: 'Subject experiences soaring environmental conditions, displaying severe overheating, disorientation, or collapse following exertion.',
        corePrinciple: 'Heat stroke is a lethal medical emergency where the core temperature exceeds 40°C. Immediate external evaporative cooling holds critical priority to prevent brain swelling and organ death.',
        procedureSteps: [
          'Contact local emergency dispatch system immediately.',
          'Position the individual into a shaded, cool sector with active air circulation.',
          'Shed excessive clothing to maximize direct body skin exposure to moving ambient air.',
          'Pack ice packets or cold, damp compresses explicitly in the groin, armpit cavities, and neck region where major blood vessels run.',
          'Fan the subject vigorously while misting the skin with room-temperature water to accelerate rapid evaporative cooling.',
          'Monitor consciousness, orientation, and respiratory pattern continuously until professional clinical turnover.'
        ],
        warnings: [
          'NEVER plunge an altered or unconscious subject into an ice bath directly; this triggers severe cardiovascular shock and vasoconstriction, capturing heat in the deep core.',
          'NEVER administer fever reducers (e.g. paracetamol, ibuprofen); they provide zero efficacy against environmental hyperthermia and place severe burden on compromised organs.',
          'NEVER force liquids down the throat of an altered or semi-conscious patient due to acute aspiration and asphyxiation risks.'
        ],
        relatedTopics: ['Dehydration', 'Hypothermia', 'Cardiopulmonary Resuscitation']
      },
      {
        id: 'severe-bleeding',
        title: 'Severe Arterial Bleeding and Tourniquets',
        shortSummary: 'Arrest lethal pulsatile bleeding from extremity wounds using direct pressure and a tourniquet.',
        situationContext: 'Severe pulsating, bright-red leakage from a limb sector following structural impact or laceration.',
        corePrinciple: 'An arterial rupture can cause exsanguination in less than 3 minutes. Applying immediate manual pressure and a certified windlass tourniquet is the single highest priority.',
        procedureSteps: [
          'Apply firm, steady manual pressure directly onto the wound site (use gloves and sterile gauze packing if possible).',
          'If extremity bleeding remains unchecked, apply a windlass tourniquet 5-8 cm proximal to the laceration zone (never directly on a joint).',
          'Tighten the windlass rod firmly until active bleeding terminates completely and a distal pulse can no longer be detected.',
          'Secure the windlass rod in its locked anchor and record the precise military time of application on the band (e.g., "T 14:32").',
          'Elevate the damaged limb, swaddle the patient in heat-reflective blankets, and proactively treat for shock.'
        ],
        warnings: [
          'NEVER place a tourniquet directly over knee or elbow joints; the bone interface will defeat vessel occlusion.',
          'NEVER loosen or cycle a locked tourniquet to check and see if bleeding stopped. Release should only be considered by qualified medical professionals in a clinical setting.',
          'NEVER resort to thin cords, wire, or standard shoelaces for tourniquets; they cut tissue and initiate irreversible limb necrosis.'
        ],
        relatedTopics: ['Heat Stroke: Identification and Treatment', 'Shock Countermeasures']
      },
      {
        id: 'cpr-aed-emergency-dispatch',
        title: 'CPR, AED and Emergency Dispatch Discipline',
        shortSummary: 'Stabilize the first minute: call emergency services, start compressions, and use an AED without losing scene control.',
        situationContext: 'A person collapses, is not breathing normally, or has agonal gasps in a home, workplace, station, trailhead, or public venue.',
        corePrinciple: 'Survival depends on a short chain: early recognition, immediate emergency call, high-quality chest compressions, early defibrillation, and clear handover to professionals.',
        procedureSteps: [
          'Check scene safety first: traffic, electricity, violence, smoke, chemicals, or water must not create a second casualty.',
          'Test responsiveness and breathing for no more than 10 seconds. If breathing is absent or abnormal, call emergency services and put the phone on speaker.',
          'Send a bystander for the nearest AED. If alone with a mobile phone, call first, then start compressions immediately.',
          'Place hands in the center of the chest and compress hard and fast, allowing full recoil between compressions.',
          'Follow AED voice prompts exactly. Keep hands off the casualty during rhythm analysis and shock delivery.',
          'Continue CPR until the person breathes normally, professional help takes over, an AED instructs otherwise, or you are physically unable to continue.'
        ],
        warnings: [
          'Do not delay CPR while searching for a perfect pulse. In doubt, start compressions.',
          'Do not touch the casualty during AED analysis or shock delivery.',
          'Do not end the emergency call before dispatch has the exact location, access code, floor, and visible meeting point.'
        ],
        relatedTopics: ['Severe Arterial Bleeding and Tourniquets', 'One-Week Blackout and Crisis Communication']
      },
      {
        id: 'ptsd-recognition-first-responder',
        title: 'Post-Traumatic Stress: Recognition and Immediate Support',
        shortSummary: 'Recognize PTSD symptoms in yourself and others after traumatic events and apply evidence-based immediate support techniques.',
        situationContext: 'Following a traumatic event - accident, violence, natural disaster, or witnessed medical emergency - a person begins showing persistent re-experiencing, avoidance, or hyperarousal symptoms.',
        corePrinciple: 'PTSD is not weakness. It is a physiological stress response to life-threatening events. Early recognition and appropriate support dramatically improve long-term recovery outcomes. Flashbacks can be triggered by sounds, smells, and images weeks or months after the event.',
        procedureSteps: [
          'Recognize the four core symptom clusters: re-experiencing (flashbacks, nightmares), avoidance (refusing reminders, emotional numbness), hyperarousal (constant alertness, sleep disruption, angry outbursts), and negative cognition (hopelessness, feeling unsafe).',
          'In the immediate aftermath of trauma, apply psychological first aid: ensure physical safety first, then offer calm, non-intrusive presence without forcing the person to talk.',
          'Speak slowly and clearly. Avoid minimizing language like "you are fine" or "it could have been worse". Validate the reaction: "What you experienced was serious. Your response is understandable."',
          'Help ground the person in the present if they dissociate: name five things they can see, four they can touch, three they can hear.',
          'Connect them with professional mental health support. In Norway: contact your GP, the local psychiatric emergency team (DPS akutt), or crisis hotline (116 123 - Kirkens SOS).',
          'For first responders and helpers: self-monitor for delayed onset symptoms in the weeks following a traumatic incident and proactively seek peer support or debriefing.'
        ],
        warnings: [
          'Do not force a traumatized person to relive the event in detail immediately after. Premature forced recounting can intensify trauma rather than resolve it.',
          'Do not diagnose or label someone with PTSD informally. Formal diagnosis requires a qualified mental health professional using structured clinical criteria.',
          'Do not interpret emotional numbness or calm after a traumatic event as evidence that the person is fine - delayed reactions are common and can emerge days or weeks later.'
        ],
        relatedTopics: ['CPR, AED and Emergency Dispatch Discipline', 'Situational Awareness and Focus Management']
      },
      {
        id: 'edc-trauma-kit-assembly',
        title: 'Every day Carry Trauma Kit: Assembly and Use',
        shortSummary: 'Build and carry a pocket-sized trauma kit for arterial bleeding control in real-world everyday situations.',
        situationContext: 'A bystander at a trail, workplace, road accident, or public event where professional EMS response will take more than 3-5 minutes.',
        corePrinciple: 'A trauma victim with severe arterial hemorrhage will be clinically dead within 3-5 minutes without intervention. Bystander bleeding control using a proper kit is the highest-ROI life-saving skill a civilian can possess. Equipment without training is inert plastic.',
        procedureSteps: [
          'Assemble a minimum viable trauma kit: windlass tourniquet (CAT or SOFTT-W), hemostatic gauze (QuikClot or Celox), pressure bandage (Israeli bandage), nitrile gloves, and a marker for noting tourniquet application time.',
          'Package the kit in a vacuum-sealed pouch no larger than a pair of sunglasses. It should fit in a jacket pocket, daypack side pocket, or car glove box.',
          'Pre-stage kits in your: primary bag, car, home, and workplace. A kit that is not accessible within 10 seconds during an emergency is not a kit.',
          'Train application on yourself and others until tourniquet use takes under 30 seconds with one hand. Practice monthly.',
          'For outdoor solo trips: supplement with a headlamp, spare batteries, and a multitool - the EDC triad for trauma and wilderness scenarios.',
          'When using it: call emergency services first (put phone on speaker), then apply direct pressure. Escalate to a tourniquet only if direct pressure fails to control severe bleeding within 60 seconds.'
        ],
        warnings: [
          'Do not use improvised materials (belts, shoelaces, zip ties) as tourniquets. They create a venous tourniquet effect that traps blood and worsens hemorrhage while causing tissue necrosis.',
          'Do not apply a tourniquet over a joint. Correct placement is 5-8 cm proximal to the wound on the upper arm or upper thigh.',
          'Do not remove or loosen a tourniquet once applied. Time of application must be marked on the band and transferred to EMS personnel verbally.'
        ],
        relatedTopics: ['Severe Arterial Bleeding and Tourniquets', 'CPR, AED and Emergency Dispatch Discipline']
      },
      {
        id: 'foot-injury-prevention-athletes',
        title: 'Foot Injury Prevention for Hikers, Runners, and Active People',
        shortSummary: 'Prevent and treat blisters, nail trauma, plantar fasciitis, and tendon injuries that can sideline active people in everyday conditions.',
        situationContext: 'Extended hiking, running, urban movement, or athletic events where foot failure would leave the person unable to keep moving safely.',
        corePrinciple: 'Foot injuries are one of the main reasons endurance athletes and active people become unable to continue. Prevention is a system: footwear fit, sock management, pre-hardening, lubrication, and early intervention.',
        procedureSteps: [
          'Footwear fit: buy hiking boots or sturdy walking shoes with a thumb-width of space at the toebox. Feet swell up to a full shoe size during prolonged activity. Size for swollen feet.',
          'Sock system: wear a thin moisture-wicking liner sock beneath a padded wool or synthetic outer sock. This two-layer system transfers friction shear from skin to the sock interface.',
          'Pre-harden skin over 4-6 weeks before major events by training in the same footwear under progressively heavier load. Toughen hot spots with antiperspirant or methylated spirits.',
          'Before longer outings: apply a thin layer of petroleum jelly (Vaseline) or trail butter to all blister-prone areas - heel, ball of foot, and pinky toe lateral edge.',
          'Treat hot spots immediately when first felt; do not wait for a blister to form. Apply athletic tape (Leukotape P or Kinesio) directly over the hot spot.',
          'If a blister forms: drain with a sterile needle at the lowest edge, leave the roof intact as a biological bandage, apply antibiotic ointment, and cover with a donut-shaped moleskin pad.'
        ],
        warnings: [
          'Do not ignore nail blackening under a toenail after heavy loading. Subungual hematoma can become infected. Drain by heating a needle and pressing through the nail at the center of the dark area.',
          'Do not cut corns, calluses, or infected skin with non-sterile instruments while away from care - infection in extremities heals slowly and can become severe under continued load.',
          'Do not use cotton socks for extended physical activity. Cotton absorbs moisture and holds it against the skin, dramatically increasing blister formation rates.'
        ],
        relatedTopics: ['Everyday Carry Trauma Kit: Assembly and Use', 'Safe Stream and River Crossing Protocols']
      }
    ]
  },
  {
    id: 'friluftsliv',
    title: 'Wilderness Survival',
    titleEnglish: 'Wilderness Survival',
    iconName: 'Compass',
    shortDescription: 'Emergency outdoor competence, wilderness routing, thermal management, and water purification.',
    philosophy: 'Harness raw natural materials and clean physics to survive unexpected alpine and forest isolation.',
    topics: [
      {
        id: 'stream-crossing',
        title: 'Safe Stream and River Crossing Protocols',
        shortSummary: 'Evaluate rapid currents, structural hydrology, and ford streams without losing foothold.',
        situationContext: 'People confronting an unbridged, fast-moving river segment requiring passage.',
        corePrinciple: 'Moving water possesses massive hydraulic force. Successful crossings require evaluating velocity baseline thresholds, bed geology, and utilizing systemic group physics.',
        procedureSteps: [
          'Locate the widest sector of the river. Wider zones typically correspond to shallower depths and reduced velocities.',
          'Toss a natural branch into the current. If it flows faster than a casual walking pace, the stream is dangerously swift.',
          'Completely unbuckle your backpack hip-belt and sternum harness. If you trip, the weighted pack must be jettisonable in a single second.',
          'Utilize a stout, dedicated wading staff on the upstream side to secure 3 constant points of ground contact (the tripod principle).',
          'Move diagonally downstream at a 45-degree vector. Keep your gaze forward, sliding your feet individually to test the bed.',
          'For group crossings: Line up parallel to the current with the strongest person positioned upstream to break the flow wedge.'
        ],
        warnings: [
          'NEVER enter waters exceeding mid-thigh depth, particularly when dealing with high turbidity or unseen riverbed geology.',
          'NEVER lock-link yourself to a heavy backpack with carabiners; water immersion will drag you beneath the surface with no escape.',
          'NEVER cross directly upstream of terminal hazards, sweeping hydraulics, or abrupt waterfalls.'
        ],
        relatedTopics: ['Hypothermia', 'Heat Stroke: Identification and Treatment']
      },
      {
        id: 'fire-starting',
        title: 'Improvised Fire Lighting in Saturated Conditions',
        shortSummary: 'Secure self-sustaining heat under torrential rain or freezing conditions with damp resources.',
        situationContext: 'Emergency isolation in wet forest environments with falling temperatures and threatened thermal baseline.',
        corePrinciple: 'Damp environments require systematically processing wood to access dry heartwood and structuring tinder with the fire triangle.',
        procedureSteps: [
          'Scavenge beneath dense spruce shelters or dry hollow trunks for birch bark (rich in volatile flammable oils) or dead resinous pine twigs.',
          'Split wet logs with a blade to expose the dry heartwood insulated deep within the core.',
          'Lay down a solid platform of thick, green wood to isolate the fragile initial spark from freezing, saturated ground.',
          'Construct a delicate, highly-aerated pyramid of shaved hearthwood feathers and bark directly over the platform.',
          'Ignite the base, allowing flames to dry out larger fuel stocks situated vertically in the draft.',
          'Steadily introduce thicker dry core fuels after a deep, radiant coal bed is established.'
        ],
        warnings: [
          'NEVER throw petroleum accelerants (e.g., gasoline) onto weak wood embers; this creates explosive splashback hazards and flashes out too fast.',
          'NEVER build fire systems directly on peat soil or underneath low, dry organic branches, preventing underground root fires.',
          'NEVER waste your limited matches or spark-rods on poorly selected wet tinder. Prep the fuel completely first.'
        ],
        relatedTopics: ['Safe Stream and River Crossing Protocols', 'Alpine Navigation']
      },
      {
        id: 'varsom-route-decision',
        title: 'Weather,  (Varsom/NVE - weather warnings) and Route-Go/No-Go Decisions',
        shortSummary: 'Use official hazard warnings and visible warning signs to decide whether to continue, reroute, shelter, or turn around.',
        situationContext: 'Before or during a trip where flood, landslide, avalanche, ice, lightning, wind, heat, or sudden weather shifts could trap the group.',
        corePrinciple: 'Good outdoor assessment is not bravery. It is an evidence loop: forecast, terrain, group capacity, time margin, and a pre-agreed turn-around point.',
        procedureSteps: [
          'Check official weather and hazard sources before departure, including Varsom/NVE where relevant.',
          'Define a hard turn-around time and minimum visibility/wind/temperature thresholds before the group becomes emotionally committed.',
          'Carry an offline map, compass, headlamp, insulation layer, and a way to preserve phone battery.',
          'Watch for warning signs that override the plan: rising water, new cracks, hollow snow, fresh debris, thunder, or wind loading.',
          'If warnings increase while you are out, move away from gullies, steep slopes, exposed ridges, and flood-prone riverbanks.',
          'Communicate the changed plan to a trusted contact as soon as signal exists.'
        ],
        warnings: [
          'Never treat a green or yellow forecast as permission to ignore local terrain signs.',
          'Never let summit fever, sunk cost, or group pressure override the agreed turn-around rule.',
          'Never rely on a phone-only navigation plan in cold, wet, or low-battery conditions.',
          'It is never too late to turn around or seek shelter. The mountain will always be there; you may not be.'
        ],
        relatedTopics: ['Safe Stream and River Crossing Protocols', 'One-Week Blackout and Crisis Communication']
      },
      {
        id: 'snow-shelter-construction',
        title: 'Emergency Snow Shelter: Quinzhee, Snow Cave, and Igloo',
        shortSummary: 'Build a thermally effective snow shelter from available materials to prevent fatal hypothermia during winter emergencies.',
        situationContext: 'Caught outdoors in winter conditions with falling temperatures and no access to existing shelter. Core temperature is at risk without immediate insulation from wind and cold.',
        corePrinciple: 'Snow is an outstanding thermal insulator. The interior of a properly built snow shelter stabilizes at -1°C to -3°C regardless of outdoor temperature, turning a lethal exposure scenario into a survivable bivouac. Internal temperature stays below freezing to prevent ceiling drip, which wets sleeping equipment.',
        procedureSteps: [
          'Site selection: find a wind-sheltered spot at the base of a steep cornice or deep drift. Probe snow depth with a ski pole - you need at least 1.5 m for a snow cave, 0.5 m for a quinzhee mound.',
          'For a snow cave (fastest): dig horizontally into a compacted snowbank at roughly body height and shoulder-width. Curve the tunnel slightly upward to trap warm air in the sleeping area above the entry. Keep ceiling thickness at least 30 cm.',
          'For a quinzhee: pile loose snow into a mound 2 m high, insert 30 cm marker sticks all around, let sintering (bonding) occur for 90 minutes, then hollow from inside using the sticks as wall-thickness gauges.',
          'Ventilation is critical: punch a 10 cm ventilation hole through the ceiling with a ski pole before sleeping. Block doorways with a snow block or pack, never seal completely.',
          'Interior setup: sleep on an elevated platform (avoids cold-air pooling at floor level), use an insulating mat between body and snow, and place gear bags at the entry to prevent body heat loss through the door gap.',
          'Never run stoves, heaters, or candles inside without confirmed ventilation - carbon monoxide accumulation is fatal and odorless.'
        ],
        warnings: [
          'Never build a snow shelter below an unstable cornice, on a slope exceeding 20°, or in an avalanche runout zone. Site choice is a primary life-safety decision.',
          'Never sleep in wet clothing inside a snow shelter. Wet insulation loses 90% of its thermal value. Change into dry layers before entering the shelter.',
          'Always mark the entrance with a visible pole or colored object so rescuers or companions can locate the shelter entrance under fresh snowfall or in reduced visibility.'
        ],
        relatedTopics: ['Improvised Fire Lighting in Saturated Conditions', 'Weather, (Varsom/NVE - weather warnings) and Route-Go/No-Go Decisions']
      },
      {
        id: 'driver-fatigue-prevention',
        title: 'Driver Fatigue: Recognition, Prevention, and Emergency Response',
        shortSummary: 'Identify the physiological signs of fatal microsleep events and apply evidence-based countermeasures before losing vehicle control.',
        situationContext: 'Long-distance driving, post-shift driving, or any journey after fewer than 6 hours of sleep - including routine commutes after irregular sleep patterns.',
        corePrinciple: 'Driver fatigue accounts for approximately 20% of road fatalities annually. Being awake for 17 continuous hours impairs driving equivalently to a BAC of 0.05. Fatal microsleep episodes - where the driver loses consciousness for 4-30 seconds - give no warning signal. The only cure is sleep.',
        procedureSteps: [
          'Before the journey: secure at least 8 hours of sleep the night before. Do not begin a long drive between 10 PM and 6 AM when circadian dip is deepest.',
          'Recognize early warning signs: yawning, heavy eyelids, difficulty maintaining lane position, missing road signs, restlessness, and making fewer but larger steering corrections.',
          'At the first sign of fatigue: exit the road safely and take a 20-minute power nap. Set a timer. Do not continue driving on caffeine alone - it delays rather than eliminates impairment.',
          'Wait 30 minutes after waking before resuming driving. Sleep inertia (residual cognitive impairment immediately post-sleep) lasts 15-30 minutes and is a genuine crash risk.',
          'Plan breaks every 2 hours regardless of fatigue level. Use designated rest areas or service stations. Share driving duties where possible.',
          'Stay hydrated; dehydration accelerates fatigue onset. Avoid alcohol, heavy fatty meals, and excessive sugar before or during driving.'
        ],
        warnings: [
          'Do not trust stimulant countermeasures (coffee, energy drinks, loud music, cold air) as substitutes for sleep. These delay impairment by 20-30 minutes at most and create false confidence.',
          'Do not ignore the microsleep warning sign of "head snapping" or nodding. A 4-second microsleep at 100 km/h covers 110 meters with zero driver control.',
          'Do not plan high-fatigue routes during holiday travel periods without checking rest area locations and building mandatory sleep stops into the itinerary.'
        ],
        relatedTopics: ['Safe Stream and River Crossing Protocols', 'Situational Awareness and Focus Management']
      },
      {
        id: 'offline-navigation-maps',
        title: 'Offline Maps, Cached Navigation, and Tech-Independent Routing',
        shortSummary: 'Pre-download offline maps and digital navigation backups so GPS and routing work without mobile data or internet.',
        situationContext: 'Traveling to areas with unreliable mobile signal: remote hiking zones, foreign countries, disaster areas, or any scenario where network-dependent navigation would strand you.',
        corePrinciple: 'Smartphone navigation is dependent on a data connection for live tile downloads. In dead zones, apps fail silently and display blank map backgrounds. Pre-cached offline maps eliminate this single point of failure at zero cost.',
        procedureSteps: [
          'Offline map packs: before departure, download the destination area in a local-first navigation app such as Organic Maps, OsmAnd, or Maps.me.',
          'Dedicated offline apps: install a vector-map app with offline routing. Download the country or region package (50-300 MB) before travel.',
          'For mountain terrain: use Kartverket (Norway) or Fatmap/AllTrails with offline packs. Download the specific trail corridor plus a 10 km buffer.',
          'Backup physical map: carry a waterproof 1:50,000 topographic map of any mountain or wilderness area. Know how to take a bearing with a baseplate compass.',
          'Save key waypoints as GPS pins before departing: trailhead, camp, nearest road, emergency shelter, and the closest town with a medical facility.',
          'Phone battery management: enable airplane mode with GPS only active during navigation. This extends battery life 4-6x compared to full LTE operation.'
        ],
        warnings: [
          'Do not assume cached road maps cover detailed topography. Many offline road tiles show roads and buildings, not terrain contours. Use a dedicated topo app for mountain navigation.',
          'Do not rely on a single device. Carry a small power bank capable of two full phone charges, or a dedicated GPS device as a backup in multi-day wilderness contexts.',
          'Do not neglect to update offline map packages before major trips. Cached maps older than 6 months may miss new roads, closures, or changed emergency facility locations.'
        ],
        relatedTopics: ['Weather, (Varsom/NVE - weather warnings) and Route-Go/No-Go Decisions', 'Documents, Payments and Embassy Fallbacks']
      },
      {
        id: 'rucking-load-bearing-fitness',
        title: 'Rucking: Load-Bearing Physical Conditioning for Preparedness',
        shortSummary: 'Build sustainable strength, cardiovascular capacity, and foot toughness through systematic loaded walking - a foundational preparedness method.',
        situationContext: 'Any preparedness context where physical capacity to carry supplies, evacuate on foot, or sustain effort under load may be required - from a 72-hour bag to extended support tasks.',
        corePrinciple: 'Loaded walking is one of the most efficient ways to build general physical preparedness without joint strain. Unlike running, it is sustainable across age groups, weather, and terrain. It builds postural strength, metabolic conditioning, mental resilience, and foot toughness simultaneously.',
        procedureSteps: [
          'Start with a 10-week progression: begin with 20% of body weight in the pack over 30-minute walks, 3x per week. Add 5 minutes per session each week.',
          'Pack setup: load weight close to the spine and high in the bag. Use rigid books, weight plates, or sand bags. A poorly loaded pack shifts the center of gravity forward and causes injury.',
          'Footwear: break in your hiking boots or sturdy footwear during rucking progression. Do not start rucking in new boots.',
          'Posture: maintain neutral spine - do not lean forward excessively. Tighten the hip belt so 60-70% of load rests on hips, not shoulders.',
          'Nutrition and hydration: consume 500-750 ml of water per hour during rucking. Carry a simple carbohydrate source (dried fruit, energy gel) for sessions exceeding 90 minutes.',
          'Progression goal: reach 30% body weight carried over 10 km in under 2 hours. This is a meaningful real-world preparedness benchmark.'
        ],
        warnings: [
          'Do not increase load and distance simultaneously in the same week. Progress only one variable at a time to prevent overuse injuries (shin splints, plantar fasciitis, IT band syndrome).',
          'Do not ruck with a frameless or low-quality bag when carrying more than 10 kg. Poor load distribution concentrates shear force at shoulder and lumbar contact points.',
          'Do not ignore foot pain. Ruck-related foot injuries compound rapidly under load and can sideline you for weeks. Treat hot spots before they become blisters.'
        ],
        relatedTopics: ['Foot Injury Prevention for Hikers, Runners, and Operators', 'Snow Shelter Construction']
      }
    ]
  },
  {
    id: 'egensikkerhet',
    title: 'Personal Safety',
    titleEnglish: 'Personal Safety',
    iconName: 'Eye',
    shortDescription: 'Mental baseline management, conflict de-escalation, threat detection, and urban transit awareness.',
    philosophy: 'Reduce the risk of conflict and emergencies through proactive situational awareness.',
    topics: [
      {
        id: 'situational-awareness',
        title: 'Situational Awareness and Focus Management',
        shortSummary: 'Train your attention to spot problems before they become physical.',
        situationContext: 'Navigating dense metropolitan corridors, foreign transit hubs, or unmonitored sectors.',
        corePrinciple: 'Divided concentration (e.g. mobile screen-locking, noise-canceling audio) marks you as a soft target. Scanning establishes time and spatial distance.',
        procedureSteps: [
          'Employ the "Cooper Color Scale": Operate consistently in Condition Yellow (focused, relaxed alertness) instead of Condition White (completely unalert).',
          'Scan surroundings using rapid circular intervals: note individuals behind, locate exit options, and spot anomalies.',
          'Determine the environment\'s normal ambient behavior (baseline). Look for any individuals breaching this code (anomalies).',
          'Observe physiological threat markers: individuals pacing, mimicking your vectors, avoiding eye contact, or attempting to close structural distance.',
          'Avoid hidden corners: Maintain distance from dark building entries, unmonitored alcoves, or idling transport vans.'
        ],
        warnings: [
          'NEVER translate alertness into frantic paranoia. The goal is logical analysis, not irrational panic.',
          'NEVER use fixed, confrontational eye contact with suspicious individuals; this may escalate tension.',
          'NEVER ignore sudden gut instincts or intuitive alerts. Leave immediately and analyze the reasons from a secure location.'
        ],
        relatedTopics: ['De-escalation and Threat Analysis', 'Urban Risks']
      },
      {
        id: 'de-escalation-exit-planning',
        title: 'De-escalation and Exit Planning',
        shortSummary: 'Lower the temperature of a confrontation while preserving distance, witnesses, and escape options.',
        situationContext: 'A stranger, colleague, family member, intoxicated person, or crowd begins escalating verbally or physically.',
        corePrinciple: 'The objective is not to win the argument. The objective is to create time, reduce stimulation, and leave with dignity and minimum injury risk.',
        procedureSteps: [
          'Move to a position with an exit behind or beside you, not directly behind the other person.',
          'Use open hands, low voice, short sentences, and non-accusatory wording such as "I hear you" or "I am leaving now."',
          'Give space. Step diagonally away rather than straight backward if the person closes distance.',
          'Create a witness layer by moving toward staff, light, cameras, or other safe adults.',
          'If the person blocks your exit, name the boundary clearly once and leave through the safest available route.',
          'Afterward, write down time, place, description, witnesses, and any threats while memory is fresh.'
        ],
        warnings: [
          'Do not mirror insults, threats, or aggressive posture.',
          'Do not turn your back until you have enough distance or a physical barrier.',
          'Do not allow politeness to trap you in a dangerous conversation.'
        ],
        relatedTopics: ['Situational Awareness and Focus Management', 'Hotel Room Safety and Room Hardening']
      },
      {
        id: 'radicalization-extremism',
        title: 'Radicalization and Extremism: Prevention and Dialogue',
        shortSummary: 'How to recognize concerning behavioral changes in youth and apply dialogue tools for prevention.',
        situationContext: 'You are concerned that a child, student, or young person is showing signs of radicalization or alignment with violent extremism.',
        corePrinciple: 'Prevention is built on early intervention, secure relationships, and open dialogue. Reporting to police or support services should occur when there is concrete concern about violent behavior or attack planning.',
        procedureSteps: [
          'Observe sudden shifts in behavior, social circles, vocabulary, or increased consumption of extremist content.',
          'Establish a safe dialogue: listen actively without condemning, be curious, and ask open-ended questions.',
          'Utilize dialogue tools to challenge extreme beliefs constructively rather than entering direct arguments.',
          'Collaborate with schools, kindergarten staff, healthcare professionals, or youth police as needed.',
          'In case of concrete and immediate threat of violent acts, contact the police immediately on 02800 or 112.'
        ],
        warnings: [
          'DO NOT directly accuse or confront the individual; this can cause isolation and accelerate radicalization.',
          'DO NOT share or distribute extremist propaganda or materials, even to warn others.',
          'DO NOT delay in seeking professional guidance if you feel the situation is escalating beyond your control.'
        ],
        relatedTopics: ['situational-awareness', 'de-escalation-exit-planning']
      }
    ]
  },
  {
    id: 'egenberedskap',
    title: 'Household Preparedness',
    titleEnglish: 'Household Preparedness',
    iconName: 'Home',
    shortDescription: 'Home resilience infrastructure, backflow prevention, emergency communications, and power utilities.',
    philosophy: 'Establish household-level self-sufficiency to absorb massive public utility blackouts.',
    topics: [
      {
        id: 'flood-home-prep',
        title: 'In-Home Flood Prevention and Flood Response',
        shortSummary: 'Secure your home and respond safely when floodwater rises quickly.',
        situationContext: 'Residential zones facing heavy flash floods, melting snow vectors, or broken water mains.',
        corePrinciple: 'Fortification against water entry requires mechanical structural isolation, while active survival relies on safe escape routing.',
        procedureSteps: [
          'Perform rigorous maintenance on rooftop gutters, outer drains, and foundation sumps.',
          'Install a physical backflow prevention valve on the main basement sewer pipeline to block sewage back-up.',
          'Stockpile heavy-duty sandbags or polymer flood barriers to block subterranean vent and window access.',
          'In acute storm arrivals: Relocate crucial papers, high-value electronics, and medical kits to the upper floors.',
          'Cut the main electrical breakers for any zones threatened by water ingress to eliminate electrocution risks.',
          'If forced to evacuate by vehicle: Drive strictly down the center crown of the road and never attempt to cross running water pools.'
        ],
        warnings: [
          'NEVER step into a flooded basement room; the standing water may be charged with lethal electrical currents.',
          'NEVER underestimate hydraulic roadway forces; as little as 30 cm of current can sweep an SUV off its tires.',
          'NEVER commence industrial water pump extraction until deep photos are captured for insurance and structural confirmation.'
        ],
        relatedTopics: ['Power Outages and Emergency Power', 'Smart Home WAN Security']
      },
      {
        id: 'iot-router-security',
        title: 'Securing Smart Home Networks and Wi-Fi Routers',
        shortSummary: 'Isolate unsecured IoT devices and defend your gateway router from scanning and compromise.',
        situationContext: 'Configuring network routers and intelligent appliances inside a private dwelling.',
        corePrinciple: 'Generic IoT products represent vulnerable pivots into private client machines. True defense lies in total compartmentalization.',
        procedureSteps: [
          'Purge default administrator credentials on the Wi-Fi gateway immediately upon deployment.',
          'Configure a distinct, isolated "Guest Network" and place all connected smart devices precisely on this secondary SSID.',
          'De-activate UPnP (Universal Plug and Play) and WPS protocols on the router firmware to prevent automatic port exposure.',
          'Disable WAN-side administration blocks (Disable Remote Management).',
          'Set the router firmware to automatic updating or schedule a manual system check monthly.'
        ],
        warnings: [
          'NEVER point internet-linked webcams towards highly sensitive private spaces or locations revealing entry codes.',
          'NEVER connect a supposedly sterile burner phone to your persistent residential Wi-Fi network; this links the device identity.'
        ],
        relatedTopics: ['Browser Hardening', 'Burner Phone Setup and Use']
      },
      {
        id: 'one-week-blackout-communication',
        title: 'One-Week Blackout and Crisis Communication',
        shortSummary: 'Prepare for power, water, payment, and mobile-network disruption without becoming dependent on one fragile channel.',
        situationContext: 'A prolonged outage, cyber incident, extreme weather event, or regional infrastructure failure affects normal utilities and communication.',
        corePrinciple: 'Household resilience is layered: water, heat, food, medicines, information, payments, and neighbor support must still function when apps do not.',
        procedureSteps: [
          'Store around 20 liters of drinking water per person and rotate it on a simple calendar.',
          'Keep shelf-stable food, manual can opener, safe cooking option, and fuel appropriate for your home.',
          'Write down emergency numbers, municipality information channels, family contacts, and a meeting point on paper.',
          'Keep cash in small denominations and know how your household will buy essentials if card terminals are unavailable.',
          'Use a battery radio for official broadcasts and conserve phones for outbound status messages.',
          'Make a neighbor plan: who needs help with medicine, mobility, children, pets, charging, or information.'
        ],
        warnings: [
          'Do not run grills, gas heaters, or generators indoors or in enclosed balconies.',
          'Do not drink untreated surface water unless it has been properly filtered and disinfected.',
          'Do not wait until the outage begins to learn where your municipality publishes crisis information.'
        ],
        relatedTopics: ['CPR, AED and Emergency Dispatch Discipline', 'Securing Smart Home Networks and Wi-Fi Routers']
      },
      {
        id: 'iodine-nuclear-preparedness',
        title: 'Iodine Tablets and Nuclear Emergency Preparedness',
        shortSummary: 'Correct storage and dosage of iodine tablets during nuclear accidents, alongside general radiation safety advice.',
        situationContext: 'Public alert systems warn of a nuclear accident releasing radioactive iodine, and authorities advise taking iodine tablets.',
        corePrinciple: 'Iodine tablets (potassium iodide) only protect against radioactive iodine and prevent thyroid cancer. They must only be taken upon explicit recommendation from authorities.',
        procedureSteps: [
          'Keep iodine tablets (Jodix) stored at home, easily accessible for all family members under 40, pregnant, and breastfeeding women.',
          'Stay indoors, close all windows and doors, and shut down ventilation systems immediately to prevent inhaling radioactive dust.',
          'Follow official communications via NRK P1, crisisinfo.no, or DSA websites.',
          'Take the tablets only when authorities (DSA) instruct to do so, following the dosage instructions for different age groups precisely.',
          'Have enough canned food and bottled water stored to avoid consuming contaminated food or water from outside.'
        ],
        warnings: [
          'DO NOT take iodine tablets preventatively before an incident occurs, or without explicit official instructions.',
          'DO NOT confuse standard dietary iodine supplements (micro-doses) with emergency potassium iodide tablets (high-dose).',
          'DO NOT leave your shelter or attempt to pick up children from school if instructions say to remain indoors.'
        ],
        relatedTopics: ['one-week-blackout-communication', 'flood-home-prep']
      },
      {
        id: 'emergency-prep-72h',
        title: '72-Hour Basic Emergency Preparedness',
        shortSummary: 'The essential supplies and procedures to sustain your household for the first 3 days of a critical utility outage or isolation event.',
        situationContext: 'Sudden loss of power, heating, or clean water due to storms, infrastructure failure, or natural events.',
        corePrinciple: 'Focus on immediate physiological survival needs: water, basic nutrition, emergency communication, and essential warmth.',
        procedureSteps: [
          'Water: Store 9 liters of water per person (3 liters per day for 3 days) in clean, food-grade containers away from direct sunlight.',
          'Food: Secure a 3-day supply of ready-to-eat, non-perishable food that requires no cooking or refrigeration.',
          'Communications: Keep a battery-powered or hand-crank radio tuned to NRK P1 for emergency alerts; save phone battery for essential outbound texts.',
          'Warmth: Gather warm layers, blankets, sleeping bags, and ensure ventilation checks for any safe auxiliary indoor heaters.',
          'First Aid: Pack a basic kit with wound dressings, pain relievers, and at least a 3-day supply of critical personal medications.',
          'Cash: Maintain a small emergency cash reserve in small banknote denominations in case digital banking networks go dark.'
        ],
        warnings: [
          'DO NOT rely on mobile networks, internet, or card payment terminals during a regional grid failure.',
          'DO NOT consume municipal tap water if a boil-water advisory is active or suspected; use stored reserves.',
          'DO NOT operate charcoal grills, gas heaters, or generators indoors or on enclosed balconies (carbon monoxide hazard).'
        ],
        relatedTopics: ['one-week-blackout-communication', 'flood-home-prep']
      },
      {
        id: 'emergency-prep-7day',
        title: '7-Day Advanced Emergency Preparedness',
        shortSummary: 'An expanded framework for household resilience, alternative utilities, and mutual aid to achieve one week of self-sufficiency.',
        situationContext: 'Prolonged regional blackout, severe supply chain failure, cyber disruption, or extended isolation due to extreme weather.',
        corePrinciple: 'Build long-term household autonomy through robust alternative heat, water purification, waste management, and local community support.',
        procedureSteps: [
          'Water: Store 21 liters of water per person (3 liters per day for 7 days), rotated annually, and keep basic gravity filtration tools.',
          'Food: Stock a 7-day reserve of dry/canned goods, and secure a safe portable stove (e.g. camping stove) with sufficient fuel.',
          'Heating: Verify alternative safe indoor heating (wood stove or certified paraffin/gas heater) and ensure functional CO and smoke alarms.',
          'Power: Keep multiple charged power banks, a car charger, and a battery-saving protocol for all communications devices.',
          'Medical: Keep iodine tablets (Jodix) accessible for household members under 40, pregnant, or breastfeeding.',
          'Sanitation: Set up a dry toilet solution (heavy-duty waste bags, bucket liner, wet wipes, and disinfectant) to manage waste if water services stop.',
          'Community: Coordinate a neighbor plan: check on vulnerable individuals, list skills, and share key resources like stoves or radios.'
        ],
        warnings: [
          'DO NOT wait for municipal or civil protection services to distribute food or water during the first week of a widespread crisis.',
          'DO NOT drink untreated surface water without filtering and boiling it first.',
          'DO NOT ignore household sanitation; proper waste containment is critical to prevent disease outbreaks during long water outages.'
        ],
        relatedTopics: ['one-week-blackout-communication', 'iodine-nuclear-preparedness']
      }
    ]
  },
  {
    id: 'personvern',
    title: 'Digital Privacy',
    titleEnglish: 'Digital Privacy',
    iconName: 'ShieldAlert',
    shortDescription: 'Secure communications, reduce metadata, use encryption, and protect against unwanted household monitoring.',
    philosophy: 'Digital privacy is basic structural security. Safeguard your data to guarantee safe real-world transit.',
    topics: [
      {
        id: 'burner-phone-sop',
        title: 'Burner Phone Setup and Use',
        shortSummary: 'Step-by-step setup, purchase, and use of a private communication device.',
        situationContext: 'Urgent need for a private communication channel (source vetting, leaving an unsafe home situation, or other sensitive contact).',
        corePrinciple: 'A burner phone only stays private if it never links back to your normal account, home network, or main device.',
        procedureSteps: [
          'Acquire a cheap, basic feature phone and a prepaid SIM with cash. Avoid outlets enforcing ID registrations.',
          'Make purchases in low-surveillance retail sectors, leaving your primary phone completely off and anchored at home.',
          'Only power up the burner phone when you are physically in a different location.',
          'Rely exclusively on hardened end-to-end encrypted suites like Signal (linked to non-identifying VoIP or prepaid targets).',
          'Disconnect the power, pull the block battery if applicable, or anchor the unit inside a Faraday bag when not operating.'
        ],
        warnings: [
          'NEVER activate your burner phone and primary smartphone at the same time or location; this commits geolocational pairing.',
          'NEVER log into personal web, commercial, bank, or social media handles on the burner platform.',
          'NEVER send standard unencrypted SMS or calls to individuals who can associate the burner profile with your real name.'
        ],
        relatedTopics: ['VPN Hardening', 'Digital Security under Partner Surveillance']
      },
      {
        id: 'domestic-violence-privacy',
        title: 'Digital Security under Partner Surveillance',
        shortSummary: 'Practical privacy steps for people in abusive or high-scrutiny domestic situations who need safer ways to ask for help.',
        situationContext: 'The person is under close device surveillance and needs to reach crisis support or plan an exit without discovery.',
        corePrinciple: 'Caution matters more than speed. Avoid visual or network changes that could trigger an unsafe reaction.',
        procedureSteps: [
          'Utilize entirely non-monitored third-party platforms for help planning (public library terminals, borrowed neighbor handsets).',
          'Deploy Incognito windows for every search, but remember that local ISP routing logs persist; perform manual browser cache wipes.',
          'Establish a sterile, pseudonym-associated email account (e.g. Proton) and never access it from shared residential screens.',
          'Grave secure communication channels deep inside non-descript utility folders (e.g., custom label "Calculator Configs").',
          'Keep a static, safe landing tab (like yr.no) active alongside, to swap screens instantly if someone approaches.'
        ],
        warnings: [
          'NEVER change all personal passwords or wipe deep browser histories overnight; this abnormal habit triggers immediate control reactions.',
          'NEVER assume deleted messages on a shared phone are gone; devices regularly sync automatic backups to shared clouds.',
          'NEVER use a hidden mobile inside the home unless you hold absolute confirmation of physical distance; screen light is easily detected.'
        ],
        relatedTopics: ['Burner Phone Setup and Use', 'Situational Awareness and Focus Management']
      },
      {
        id: 'device-permission-audit',
        title: 'Mobile Device Permission and Account Audit',
        shortSummary: 'Reduce routine tracking by tightening permissions, cloud sessions, shared accounts, and recovery channels.',
        situationContext: 'Monthly privacy maintenance, after relationship changes, before travel, or when you suspect unwanted access to your accounts.',
        corePrinciple: 'Most personal data exposure comes from normal convenience settings: persistent location, shared cloud access, weak recovery, and over-permissioned apps.',
        procedureSteps: [
          'Review location permissions and downgrade most apps to "while using" or "never".',
          'Remove unknown devices and old sessions from operating-system, cloud, social, banking, and email accounts.',
          'Move important passwords into a password manager and replace reused passwords with unique ones.',
          'Enable app-based two-factor authentication on email, banking, cloud storage, and messaging accounts.',
          'Audit shared albums, calendars, family location features, Bluetooth trackers, and smart-home access.',
          'Back up critical documents offline before major account changes.'
        ],
        warnings: [
          'Do not make sudden visible privacy changes if you are being monitored by an abusive partner; plan with a support service first.',
          'Do not rely on incognito mode as anonymity. It mainly hides local browsing history.',
          'Do not keep account recovery tied to an email or phone number someone else can access.'
        ],
        relatedTopics: ['Digital Security under Partner Surveillance', 'Securing Smart Home Networks and Wi-Fi Routers']
      }
    ]
  },
  {
    id: 'reisesikkerhet',
    title: 'Travel Security',
    titleEnglish: 'Travel Security',
    iconName: 'Plane',
    shortDescription: 'Document redundancy, financial containment, international risk profiles, and local scan prevention.',
    philosophy: 'Arrive resilient through practical travel habits, scam awareness, and local safety awareness.',
    topics: [
      {
        id: 'cuba-baby-milk-scam',
        title: 'The Baby Milk Scam (Latin America / Metropolis)',
        shortSummary: 'Detect and bypass highly emotional provision extortion scams targeted at global tourists.',
        situationContext: 'Travelers approached by an apparently distressed guardian with an infant in immediate vicinity of a local grocery outlet.',
        corePrinciple: 'Scammers exploit raw, involuntary empathy to direct tourists to pay inflated retail prices for formula, split with local store owners.',
        procedureSteps: [
          'The solicitor avoids direct currency demands to build trust, urging you to purchase specialized baby formula inside a specific nearby store.',
          'The store clerk demands an inflated price (often $50?$100 USD) for the specific item, working in collusion.',
          'Upon your departure with a clear conscience, the solicitor immediately returns the goods and splits the cash with the clerk.',
          'Identify the hallmark signal: A solicitor refusing basic food bundles or generic items, routing you solely to a high-cost storefront.'
        ],
        warnings: [
          'NEVER yield to high-intensity emotional street plays; maintain detached, analytical observation.',
          'NEVER enter rear corridors or alleys with street sellers to inspect goods or receive promise of better exchange values.',
          'NEVER react with open hostility or physical friction; smile politely, indicate "No, gracias", and maintain your transit vector.'
        ],
        relatedTopics: ['Situational Awareness and Focus Management', 'Financial Isolation & Cash Safety']
      },
      {
        id: 'hotel-room-security',
        title: 'Hotel Room Safety and Room Hardening',
        shortSummary: 'Secure your lodging envelope against unauthorized key overrides, intrusion, and theft vectors.',
        situationContext: 'Lodging in foreign jurisdictions, particularly metropolitan settings with elevated property crime baselines.',
        corePrinciple: 'Card locks on hotel doors are easily bypassed by bad personnel or intruders. Mechanical secondary isolation is required.',
        procedureSteps: [
          'Request a room situated between floors 2 and 6. This avoids street break-ins, while remaining within reach of standard fire ladders.',
          'Engage the physical deadbolt, safety chain, or physical swing-bar immediately upon entering.',
          'Pack a standard heavy rubber door wedge and jam it underneath the entry door from the inside at night.',
          'Keep the TV or audio unit marginally active and place "Do Not Disturb" signage on the handle while you are away.',
          'Secure high-value gear inside the safe, but place an essential item (e.g., your left shoe) in with it, guaranteeing you execute a full check on checkout.'
        ],
        warnings: [
          'NEVER announce your specific room assignment loudly in public, lobby, or dining spaces.',
          'NEVER open hotel doors for unannounced maintenance or hotel workers without dialing the main reception directly for verification.',
          'NEVER trust in-room digital codes blindly. Many hotels retain standard override numbers (like 0000) that thieves exploit.'
        ],
        relatedTopics: ['Financial Isolation & Cash Safety', 'Digital Security under Partner Surveillance']
      },
      {
        id: 'document-money-redundancy',
        title: 'Documents, Payments and Embassy Fallbacks',
        shortSummary: 'Build redundancy for passports, insurance, money, prescriptions, and official help before the trip goes wrong.',
        situationContext: 'International travel where theft, illness, border delay, unrest, card blocking, or phone loss can strand you.',
        corePrinciple: 'Travel resilience is separation. Never allow one bag, one phone, one bank card, or one cloud account to become the single point of failure.',
        procedureSteps: [
          'Keep passport, backup ID copy, travel insurance, prescriptions, and key booking references available both offline and on paper.',
          'Split payment methods across body, day bag, and hotel safe; include modest local cash or widely accepted currency.',
          'Register or note your embassy/consulate contact routes and your foreign ministry emergency number before departure.',
          'Share itinerary, accommodation, and local transport plan with a trusted contact at home.',
          'Use a lock-screen emergency note with first name, blood type if known, allergies, and emergency contact.',
          'If robbed, prioritize physical safety, police report, card freeze, embassy contact, and replacement documents in that order.'
        ],
        warnings: [
          'Do not store every document copy only inside the phone that may be stolen.',
          'Do not carry all cards and cash in the same wallet.',
          'Do not post real-time hotel, flight, or route details publicly while still in transit.'
        ],
        relatedTopics: ['Hotel Room Safety and Room Hardening', 'Situational Awareness and Focus Management']
      }
    ]
  }
];


// ============================================================================
// NORWEGIAN SYSTEM DATA (ORIGINAL TRANSLATED BACKUP)
// ============================================================================

export const pillarsDataNo: Pillar[] = [
  {
    id: 'førstehjelp',
    title: 'Førstehjelp',
    titleEnglish: 'First Aid & Trauma Care',
    iconName: 'HeartPulse',
    shortDescription: 'Praktisk medisinsk kunnskap når profesjonell hjelp er forsinket.',
    philosophy: 'Evidensbasert, umiddelbart handlingsbar medisinsk veiledning.',
    topics: [
      {
        id: 'heat-stroke-protocol',
        title: 'Heteslag: Identifisering og behandling',
        shortSummary: 'Hvordan gjenkjenne og behandle livstruende heteslag under høye temperaturer.',
        situationContext: 'Befinner seg i varme omgivelser, pasienten viser tegn på alvorlig overoppheting etter fysisk anstrengelse eller soleksponering.',
        corePrinciple: 'Heteslag er en akutt medisinsk nødssituasjon der kroppens temperatur overstiger 40°C. Rask ekstern nedkjøling er kritisk for å hindre hjerneskade og organsvikt.',
        procedureSteps: [
          'Ring 113 (eller nødnummeret der du er) umiddelbart.',
          'Flytt pasienten til et skyggefullt og kjølig område med god luftsirkulasjon.',
          'Fjern overflødige klær for å maksimere eksponering av hud for luft.',
          'Plasser isposer eller kalde, våte omslag spesifikt i lysken, armhulene og rundt nakken der store blodårer ligger rett under huden.',
          'Vift aktivt over pasienten mens du fukter huden med romtemperert vann for å stimulere fordampningskjøling.',
          'Overvåk pasientens bevissthet og pust kontinuerlig til medisinsk personell ankommer.'
        ],
        warnings: [
          'IKKE senk en bevisstløs pasient ned i et iskaldt isbad umiddelbart; dette kan utløse sirkulasjonssjokk og kraftig vasokonstriksjon som faktisk stenger varmen inne i kjernen.',
          'IKKE gi pasienten febernedsettende medisiner (som Paracet el.l.) - det hjelper ikke mot miljøbetinget hypertermi og kan skade leveren.',
          'IKKE tving pasienten til å drikke store mengder væske hvis de er desorienterte eller har nedsatt bevissthet (risiko for kvelning og oppkast).'
        ],
        relatedTopics: ['Dehydrering', 'Hypotermi', 'Hjerte-lunge-redning']
      },
      {
        id: 'severe-bleeding',
        title: 'Alvorlige blødninger og tourniquet',
        shortSummary: 'Stoppe livstruende arterielle blødninger ved hjelp av trykk og tourniquet.',
        situationContext: 'Kraftig pulserende blødning fra en ekstremitet (arm eller ben) etter en ulykke.',
        corePrinciple: 'Ved arterielle blødninger kan en person blø i hjel på under tre minutter. Direkte trykk og rask påføring av godkjent tourniquet (årepresse) redder liv.',
        procedureSteps: [
          'Legg umiddelbart hardt, direkte trykk på såret med hendene (bruk hansker eller trykkbandasje hvis tilgjengelig).',
          'Hvis blødningen ikke stopper på et ben eller arm, påfør en tourniquet 5-8 cm over sårstedet (aldri direkte over et ledd).',
          'Stram tourniqueten ved å vri strammepinnen til blødningen har stoppet helt og du ikke lenger kan føle pulsen distalt.',
          'Lås strammepinnen på plass og skriv det nøyaktige klokkeslettet for påføring på båndet (f.eks. "T 14:32").',
          'Hev den blødende ekstremiteten om mulig, hold pasienten varm, og forebygg sirkulasjonssjokk.'
        ],
        warnings: [
          'IKKE plasser en tourniquet direkte over albue eller kne; trykket vil ikke komprimere blodårene tilstrekkelig.',
          'IKKE løsne på en påført tourniquet for å "sjekke om det har stoppet". Dette må kun gjøres av kirurgisk personell på sykehus.',
          'IKKE bruk tynne tråder, ståltråd eller skolisser som improvisert tourniquet, da de vil skjære gjennom huden og ødelegge vevet permanent.'
        ],
        relatedTopics: ['Heteslag: Identifisering og Behandling', 'Sjokkbehandling']
      },
      {
        id: 'cpr-aed-emergency-dispatch',
        title: 'HLR, hjertestarter og nødvarsling',
        shortSummary: 'Stabiliser det første minuttet: ring nødtelefon, start kompresjoner og bruk hjertestarter uten å miste kontroll på stedet.',
        situationContext: 'En person faller om, puster ikke normalt eller gisper unormalt hjemme, på jobb, i kollektivknutepunkt, på tur eller i offentlig rom.',
        corePrinciple: 'Overlevelse avhenger av kjeden: tidlig gjenkjenning, rask nødvarsling, gode brystkompresjoner, tidlig defibrillering og tydelig overlevering.',
        procedureSteps: [
          'Sjekk egen sikkerhet først: trafikk, strøm, vold, røyk, kjemikalier eller vann må ikke skape en ny pasient.',
          'Test respons og pust i maksimalt 10 sekunder. Hvis pusten er fraværende eller unormal, ring 113 og sett telefonen på høyttaler.',
          'Send en person etter nærmeste hjertestarter. Er du alene med mobil, ring først og start kompresjoner umiddelbart.',
          'Plasser hendene midt på brystet og trykk hardt og raskt, med full tilbakeslipp mellom kompresjonene.',
          'Følg hjertestarterens stemmeinstruks nøyaktig. Ingen skal berøre pasienten under analyse eller støt.',
          'Fortsett HLR til personen puster normalt, profesjonelle tar over, hjertestarteren ber deg stoppe, eller du fysisk ikke klarer mer.'
        ],
        warnings: [
          'Ikke forsink HLR fordi du leter etter perfekt puls. Ved tvil: start kompresjoner.',
          'Ikke berør pasienten under analyse eller støt fra hjertestarter.',
          'Ikke avslutt samtalen før 113 har nøyaktig adresse, adkomst, etasje og møtepunkt.'
        ],
        relatedTopics: ['Alvorlige Blødninger og Tourniquet', 'én uke strømbrudd og krisekommunikasjon']
      },
      {
        id: 'ptsd-recognition-first-responder',
        title: 'Posttraumatisk stress: Gjenkjenning og umiddelbar støtte',
        shortSummary: 'Gjenkjenn symptomer på PTSD hos deg selv og andre etter traumatiske hendelser, og bruk kunnskapsbaserte støttemetoder.',
        situationContext: 'Etter en traumatisk hendelse - ulykke, vold, naturkatastrofe eller witnessing av medisinsk nødsituasjon - viser en person vedvarende gjenopplevelse, unngåelse eller hyperaktivering.',
        corePrinciple: 'PTSD er ikke svakhet. Det er en fysiologisk stressreaksjon på livstruende hendelser. Tidlig gjenkjenning og riktig støtte gir dramatisk bedre langtidsprognose. Flashbacks kan utløses av lyder, lukter og bilder uker eller måneder etter hendelsen.',
        procedureSteps: [
          'Gjenkjenn de fire kjernesymptomene: gjenopplevelse (flashbacks, mareritt), unngåelse (å unngå påminnelser, følelsesmessig nummenhet), hyperaktivering (konstant årvåkenhet, søvnproblemer, sinneutbrudd) og negativ kognisjon (håpløshet, utrygghet).',
          'I den umiddelbare etterkant av traumer, bruk psykologisk førstehjelp: sikre fysisk trygghet først, deretter tilby rolig, ikke-påtrengende nærvær uten å tvinge personen til å snakke.',
          'Snakk sakte og tydelig. Unngå bagatellisering som "du er fint" eller "det kunne vært verre". Valider reaksjonen: "Det du opplevde var alvorlig. Din reaksjon er forståelig."',
          'Hjelp personen å grunne seg i nåtid ved dissosiasjon: nevn fem ting de kan se, fire de kan røre, tre de kan høre.',
          'Koble dem til faglig psykisk helsestøtte. I Norge: kontakt fastlege, lokalt DPS akutt, eller kristelefon 116 123 (Kirkens SOS).',
          'For førsterespondere og hjelpere: følg med på egne forsinkede symptomer i ukene etter en traumatisk hendelse og søk proaktivt kollegastøtte eller debriefing.'
        ],
        warnings: [
          'Ikke tving en traumatisert person til å gjenoppleve hendelsen i detalj umiddelbart etterpå. Tvungen tidlig gjennomgang kan forsterke traumet i stedet for å løse det.',
          'Ikke diagnoser eller stemple noen med PTSD uformelt. Formell diagnose krever kvalifisert psykisk helsepersonell med strukturerte kliniske kriterier.',
          'Ikke tolke emosjonell nummenhet eller ro etter en traumatisk hendelse som bevis på at personen har det bra - forsinkede reaksjoner er vanlige og kan dukke opp dager eller uker senere.'
        ],
        relatedTopics: ['HLR, hjertestarter og nødvarsling', 'Situasjonsforståelse og fokusstyring']
      },
      {
        id: 'edc-trauma-kit-assembly',
        title: 'Traumekit til hverdagsbruk: Innhold og bruk',
        shortSummary: 'Bygg og bær et lommestort traumekit for blødningskontroll i hverdagssituasjoner.',
        situationContext: 'En tilfeldig forbipasserende ved sti, arbeidsplass, trafikkulykke eller offentlig arrangement der profesjonell responstid er mer enn 3-5 minutter.',
        corePrinciple: 'Et traumeoffer med alvorlig arteriell blødning er klinisk død innen 3-5 minutter uten intervensjon. Blødningskontroll fra tilfeldig forbi er den høyest-avkastende livreddende ferdigheten en sivil kan ha. Utstyr uten trening er inert plast.',
        procedureSteps: [
          'Sett sammen et minimalt traumekit: windlass tourniquet (CAT eller SOFTT-W), hemostatisk kompresse (QuikClot eller Celox), trykkbandasje (israelsk bandasje), nitrilhansker og en markør for å skrive tourniquettid.',
          'Pakk kitet i en vakuumforseglet pose på størrelse med et par solbriller. Det skal passe i en jakkefrakke, dagsekkens sidelomme eller i bilens hanskerom.',
          'Forhåndsplasser kit i: primærbag, bil, hjem og arbeidsplass. Et sett som ikke er tilgjengelig innen 10 sekunder under en nødsituasjon, er ikke et sett.',
          'Tren på deg selv og andre til tourniquet-påføring tar under 30 sekunder med én hånd. Tørrtren månedlig.',
          'For solo-turer utendørs: supplement med hodelykt, reservebatterier og multiverktøy - EDC-triaden for traume og villmarkssituasjoner.',
          'Ved utrykning: ring nødtelefon først (sett på høyttaler), deretter påfør direkte trykk. Eskaler til tourniquet kun hvis direkte trykk ikke stopper arteriell ekstremitetsblødning innen 60 sekunder.'
        ],
        warnings: [
          'Ikke bruk improviserte materialer (belter, skolisser, kabelbånd) som tourniquet. De skaper en venøs tourniquet-effekt som fanger blod og forverrer blødningen mens de skaper vevsnekrose.',
          'Ikke påfør tourniquet over et ledd. Korrekt plassering er 5-8 cm proksimalt fra såret på overarm eller øvre lår.',
          'Ikke fjern eller løsne en påført tourniquet. Påføringstidspunktet skal skrives på båndet og overleveres til ambulansepersonell verbalt.'
        ],
        relatedTopics: ['Alvorlige blødninger og tourniquet', 'HLR, hjertestarter og nødvarsling']
      },
      {
        id: 'foot-injury-prevention-athletes',
        title: 'Fotskadeforebygging for turgåere, løpere og aktive mennesker',
        shortSummary: 'Forebygging og behandling av blemmer, neglskader, plantar fasciitt og seneproblemer som reduserer fysisk kapasitet over tid.',
        situationContext: 'Langtur, ryggsekktrening, urban bevegelse eller idrettsarrangementer der fotsvikt kunne gjort det vanskelig å evakuere seg selv.',
        corePrinciple: 'Fotskader er en av de vanligste årsakene til at aktive mennesker mister funksjon i hverdagen. Forebygging er et system: skopassform, sokkhåndtering, tilvenning, smøring og tidlig intervensjon.',
        procedureSteps: [
          'Skopassform: kjøp solide sko (f.eks. tursko) med en tommelfingerbreds plass ved tærne. Føtter sveller opp til en hel skostørrelse under langvarig aktivitet. Velg størrelse for hovne føtter.',
          'Sokksystem: bruk en tynn fuktighetsavledende innersokk under en polstret ull- eller syntetisk yttersokk. Dette to-lags systemet overfører friksjonskreftene fra huden til sokkegrensesnittet.',
          'Forherd huden 4-6 uker før store arrangement ved å trene i samme fottøy med gradvis tyngre last. Tøff hotspots med antiperspirant eller metylert sprit.',
          'Før lange turer: påfør et tynt lag vaselin eller fotsalve på alle blemme-utsatte områder - hæl, fotsåle og ytterside av lille tå.',
          'Behandl varme flekker umiddelbart når de først kjennes; ikke vent til det oppstår en blemme. Påfør idrettstape (Leukotape P eller Kinesio) direkte over det varme punktet.',
          'Hvis en blemme oppstår: tøm med steril nål ved laveste punkt, la taket sitte intakt som biologisk bandasje, påfør antibiotikasalve og dekk med et ringformet moleskin-/gnagsårplaster.'
        ],
        warnings:[
          'Ikke ignorer mørkning under en tånegl etter tung belastning. Underneglshematom kan bli infisert. Tøm ved å varme en nål og trykke gjennom negleplaten i midten av det mørke området.',
          'Ikke skjær vorter, liktorn eller infisert hud med ikke-sterile instrumenter underveis - infeksjoner i ekstremiteter leges sakte og kan bli alvorlige under fortsatt belastning.',
          'Ikke bruk bomullssokker for langvarig fysisk aktivitet. Bomull absorberer fuktighet og holder den mot huden, noe som dramatisk øker blemmedannelse.'
        ],
        relatedTopics: ['Lommeformat traumekit: Innhold og bruk', 'Sikker kryssing av elv og strøm']
      }
    ]
  },
  {
    id: 'friluftsliv',
    title: 'Friluftsliv',
    titleEnglish: 'Wilderness Survival',
    iconName: 'Compass',
    shortDescription: 'Overlevelsesteknikker, risikovurdering og mestring av naturelementene.',
    philosophy: 'Praktiske ferdigheter for trygg ferdsel og håndtering av uforutsette hendelser i villmarken.',
    topics: [
      {
        id: 'stream-crossing',
        title: 'Sikker kryssing av elv og strøm',
        shortSummary: 'Hvordan evaluere strømforhold og krysse elver i villmarken uten å bli feid av gårde.',
        situationContext: 'Friluftsfolk som møter en uoversiktlig eller stri elv uten bro under vandring, og må vurdere trygg kryssing.',
        corePrinciple: 'Vann i bevegelse har enorm kraft. Kryssing krever systematisk vurdering av dybde, bunnforhold, strømhastighet og riktig gruppeteknikk.',
        procedureSteps: [
          'Søk etter det bredeste punktet til elven. Bredere partier er ofte grunnere og har lavere strømhastighet enn trange slukter.',
          'Kast en liten pinne ut i vannet for å måle hastigheten. Hvis den flyter raskere enn du klarer å gå rolig ved siden av, er elven sannsynligvis for stri til å krysses.',
          'Løsne hoftebeltet og brystremmen på ryggsekken før du går ut i vannet. Hvis du faller, må sekken kunne kastes av på et sekund.',
          'Bruk en solid vandrestav på oppstrøms side for å beholde tre kontaktpunkter med bunnen til enhver tid (trefots-prinsippet).',
          'Gå skrått nedstrøms i en vinkel på ca. 45 grader. Se framover og flytt én fot av gangen, føl deg fram på bunnen før du legger tyngden på foten.',
          'Ved gruppekryssing: Gå parallelt på linje der den sterkeste personen står øverst i strømmen (skaper en strømskygge for de bak).'
        ],
        warnings: [
          'IKKE krysse elver som går høyere enn til lårene dine, spesielt ikke hvis vannet er uklart og bunnen usynlig.',
          'IKKE fest deg til ryggsekken med karabinkroker eller tette bindeledd under kryssing; en drukningstrussel oppstår umiddelbart hvis sekken fylles med vann.',
          'IKKE krysse rett over områder med store "vaskemaskiner", stryk, eller rett ovenfor et fossefall.'
        ],
        relatedTopics: ['Hypotermi', 'Heteslag: Identifisering og Behandling']
      },
      {
        id: 'fire-starting',
        title: 'Improvisert ildtenning og bål i vått vær',
        shortSummary: 'Etablering av varme under ekstreme forhold med våte materialer.',
        situationContext: 'Nødssituasjon i skogen med regnvær og fallende temperatur, der rask varme er kritisk.',
        corePrinciple: 'Fuktig vær krever at man finner beskyttet tørr kjerneved og bruker riktig oppbygning av bålet (ild-trekanten).',
        procedureSteps: [
          'Søk under tette granbar eller i hullrom på trestammer etter tørre tennkilder. Bjørkenever (inneholder brennbare oljer) og tørre grankvister helt inntil stammen fungerer best.',
          'Spikk eller spalt våte bakhon eller kubber med kniv for å avdekke den tørre kjernen på innsiden av veden.',
          'Lag en tørr plattform på bakken av noen tykke pinner slik at bålet ikke slukkes av den kalde, fuktige jorda eller snøen.',
          'Bygg en liten pyramide av knust bjørkenever og tynne fliser av tørr kjerneved over plattformen.',
          'Tenn på nedenfra slik at flammene naturlig stiger oppover og tørker ut det neste laget med tynn brensel.',
          'Legg gradvis på tykkere ved etter hvert som glohaugen bygger seg opp og skaper solid strålevarme.'
        ],
        warnings: [
          'IKKE bruk bensin, tennvæske eller andre uforutsigbare kjemikalier direkte på et svakt bål; det skaper eksplosjonsfare og brenner ut for fort.',
          'IKKE fyr opp bål direkte på torvjord eller rett under lave, tørre greiner da dette kan starte skogbrann eller rotbrann som ulmer i ukesvis.',
          'IKKE kast bort alle fyrstikkene eller tennstål-gnistene på dårlig forberedt tennmateriale. Spar ressursene til alt er klargjort.'
        ],
        relatedTopics: ['Sikker Kryssing av Elv og Strøm', 'Sikkerhet i fjellet']
      },
      {
        id: 'varsom-route-decision',
        title: 'Vær, (Varsom/NVE - værvarsel) og turens gå/ikke-gå-beslutning',
        shortSummary: 'Bruk offisielle farevarsler og tydelige tegn i terrenget til å velge om du fortsetter, snur, søker ly eller legger om ruten.',
        situationContext: 'Før eller under tur der flom, jordskred, snøskred, is, lyn, vind, varme eller raske værskifter kan fange gruppen.',
        corePrinciple: 'Godt friluftsliv er ikke tøffhet. Det er en beslutningssløyfe: varsel, terreng, gruppens kapasitet, tidsmargin og forhåndsavtalt snupunkt.',
        procedureSteps: [
          'Sjekk offisielle vær- og naturfarekilder før avreise, inkludert Varsom/NVE for værvarsel der det er relevant.',
          'Avtal snutid og minimumskrav til sikt, vind og temperatur før gruppen blir følelsesmessig bundet til målet.',
          'Ha offline-kart, kompass, hodelykt, isolasjonslag og rutine for å spare mobilbatteri.',
          'Se etter tydelige tegn i terrenget som overstyrer planen: stigende vann, nye sprekker, drønn i snøen, ferskt skredmateriale, torden eller vindtransportert snø.',
          'Hvis varslene øker mens du er ute, trekk bort fra bekkedaler, bratte heng, utsatte rygger og flomutsatte elvekanter.',
          'Gi beskjed om endret plan til en pålitelig kontakt så snart du har dekning.'
        ],
        warnings: [
          'Ikke tolk grønt eller gult varsel som tillatelse til å ignorere lokale terrengtegn.',
          'Ikke la toppfeber, gruppepress eller allerede investert tid overstyre snuregelen.',
          'Ikke baser navigasjonen kun på telefon i kulde, regn eller lavt batteri.'
        ],
        relatedTopics: ['Sikker Kryssing av Elv og Strøm', 'én uke strømbrudd og krisekommunikasjon']
      },
      {
        id: 'snow-shelter-construction',
        title: 'Nødovernatting i snø: Snøhule, quinzhee og igloo',
        shortSummary: 'Bygg et termisk effektivt snøly av tilgjengelige materialer for å hindre dødelig hypotermi under vintervær.',
        situationContext: 'Fanget utendørs i vinterforhold med fallende temperatur og uten tilgang til eksisterende ly. Kjernetemperatur er i fare uten umiddelbar isolasjon fra vind og kulde.',
        corePrinciple: 'Snø er en fremragende varmeisolator. Innvendig temperatur i et korrekt bygget snøhus stabiliseres på -1 °C til -3 °C uavhengig av utetemperatur, og gjør et potensielt dødelig eksponeringsscenario til et overlevbart bivuakk. Temperaturen holdes under frysepunktet for å unngå takdrypp som våter sovemat.',
        procedureSteps: [
          'Valg av sted: finn et vindskjermet sted ved foten av en stor snøskavl eller i et dypt snødrift. Sond snødybden med en skistav - du trenger minst 1,5 m for snøhule, 0,5 m for quinzhee-haug.',
          'For snøhule (raskeste): grav horisontalt inn i en kompakt snøbank i ca. kroppshøyde og skulderbredde. Kurv tunnelen litt oppover for å fange varm luft i soveplassen over inngangen. Hold taket minst 30 cm tykt.',
          'For quinzhee: stable løs snø i en 2 m høy haug, stikk 30 cm merkepinner rundt, la sintering (herding) skje i 90 minutter, deretter hul ut innenfra ved hjelp av pinnene som veggtykkelsesmålere.',
          'Ventilasjon er avgjørende: lag et 10 cm ventilasjonshull gjennom taket med en skistav før du sover. Blokker dørene med en snøblokk eller sekk, aldri forsegl helt.',
          'Innvendig oppsett: sov på en hevet plattform (unngår kaldluftsansamling på gulvnivå), bruk isolerende underlag mellom kropp og snø, og plasser utstyrsbager ved inngangen for å hindre varmetap gjennom dørsprekken.',
          'Kjør aldri ovner, varmeapparater eller lys innendørs uten bekreftet ventilasjon - karbonmonoksid-ansamling er dødelig og luktfri.'
        ],
        warnings: [
          'Bygg aldri snøhus under ustabil skavl, i skråning brattere enn 20°, eller i skredutsatt sone. Stedsvalg er en primær livssikkerhetsbeslutning.',
          'Sov aldri i våte klær inne i et snøhus. Våt isolasjon mister 90 % av sin termiske verdi. Skift til tørre lag før du går inn i ly.',
          'Merk alltid inngangen med en synlig stake eller farget gjenstand slik at redningsmannskaper eller følgesvenner kan finne ly-inngangen under nysnø eller i dårlig sikt.'
        ],
        relatedTopics: ['Improvisert ildtenning og bål i vått vær', 'Vær, (Varsom/NVE - værvarsel) og turens gå/ikke-gå-beslutning']
      },
      {
        id: 'driver-fatigue-prevention',
        title: 'Tretthet bak rattet: Gjenkjenning, forebygging og beredskap',
        shortSummary: 'Identifiser de fysiologiske tegnene på dødelig mikrosøvn og bruk kunnskapsbaserte mottiltak før du mister kjøretøykontrollen.',
        situationContext: 'Langkjøring, kjøring etter skiftarbeid, eller enhver tur etter færre enn 6 timer søvn - inkludert vanlige pendlerturer etter uregelmessige søvnmønstre.',
        corePrinciple: 'Tretthet bak rattet utgjør omtrent 20 % av trafikkomkomne årlig. Å være våken i 17 sammenhengende timer svekker kjøring tilsvarende en promille på 0,05. Dødelige mikrosøvnepisoder - der sjåføren mister bevisstheten i 4-30 sekunder - gir ingen advarselssignal. Den eneste kuren er søvn.',
        procedureSteps: [
          'Før kjøreturen: sikre minst 8 timer søvn natten før. Ikke start en langtur mellom kl. 22 og 06 når det døgnfysiologiske nedgangspunktet er dypest.',
          'Gjenkjenn tidlige varseltegn: gjesping, tunge øyelokk, problemer med å holde filposisjonen, å misse veiskilt, uro og å gjøre færre men større styringskorreksjoner.',
          'Ved første tegn til tretthet: kjør trygt av veien og ta en 20 minutters lur. Sett vekker. Ikke fortsett på koffein alene - det forsinker, men eliminerer ikke, svekkelsen.',
          'Vent 30 minutter etter oppvåkning før du gjenopptar kjøringen. Søvntryghet (resterende kognitiv svekkelse rett etter søvn) varer 15-30 minutter og er en reell ulykkesrisiko.',
          'Planlegg pauser hvert 2. time uavhengig av trøtthetsnivå. Bruk godkjente hvileområder eller servicestasjoner. Del kjøringen med reisefølge der det er mulig.',
          'Hold deg hydrert; dehydrering akselererer tretthetsutvikling. Unngå alkohol, tung fettmat og overdreven sukker før eller under kjøring.'
        ],
        warnings: [
          'Stol ikke på stimulanser (kaffe, energidrikk, høy musikk, kald luft) som erstatning for søvn. Disse forsinker svekkelsen med 20-30 minutter og skaper falsk trygghet.',
          'Ikke ignorer mikrosøvnadvarselstegnet "hodejerk" eller nikkende hodebevegelse. En 4-sekunders mikrosøvn ved 100 km/t tilsvarer 110 meter med null sjåførkontroll.',
          'Ikke planlegg høy-tretthetsruter i ferietidsperioder uten å sjekke hvileområder og bygge obligatoriske søvnstopp inn i reiseplanen.'
        ],
        relatedTopics: ['Sikker kryssing av elv og strøm', 'Situasjonsforståelse og fokusstyring']
      },
      {
        id: 'offline-navigation-maps',
        title: 'Nedlastede kart og teknologi-uavhengig navigasjon',
        shortSummary: 'Forhåndsnedlast offline kart og digitale navigasjonsbakups slik at GPS og ruteplanlegging fungerer uten mobildata eller internett.',
        situationContext: 'Reise til områder med upålitelig mobilsignal: fjell, friluftsområder, utland, katastrofeområder eller ethvert scenario der nettverksavhengig navigasjon ville satt deg fast.',
        corePrinciple: 'Smarttelefon-navigasjon er avhengig av dataforbindelse for live kartlasting. I blindsoner feiler apper stille og viser blankt kartbakgrunn. Forhåndsbufrede offline-kart eliminerer dette enkelt-feilpunktet uten kostnad.',
        procedureSteps: [
          'Offline-kartpakker: last ned destinasjonsområdet i en lokal-først navigasjonsapp som Organic Maps, OsmAnd eller Maps.me før avreise.',
          'Dedikerte offline-apper: installer en vektorkart-app med offline ruteplanlegging. Last ned land- eller regionpakken (50-300 MB) før reisen.',
          'For fjellterreng: bruk Kartverket (Norge) eller Fatmap/AllTrails med offline-pakker. Last ned den spesifikke turkorridoren pluss 10 km buffer.',
          'Fysisk reservekart: bær et vanntett 1:50 000 topografisk kart for ethvert fjell- eller villmarksområde. Lær å ta en peiling med et baselatekompass.',
          'Lagre nøkkelveipunkter som GPS-pinner før avreise: trailhead, leir, nærmeste vei, nødly og nærmeste by med legetjeneste.',
          'Batteristyring på telefon: aktiver flymodus med bare GPS aktiv under navigasjon. Dette forlenger batteritid 4-6x sammenlignet med full LTE-drift.'
        ],
        warnings: [
          'Ikke anta at bufrede veikart dekker detaljert topografi. Mange offline veikart viser veier og bygninger, ikke terrengkonturer. Bruk dedikert topo-app for fjellnavigasjon.',
          'Ikke stol på én enkelt enhet. Bær en liten strømbank som kan lade telefonen to ganger, eller en dedikert GPS-enhet som backup i flerdag-villmarkskontekster.',
          'Ikke forsøm å oppdatere offline-kartpakker før større turer. Bufrede kart eldre enn 6 måneder kan mangle nye veier, stenginger eller endrede nødfasiliteters beliggenhet.'
        ],
        relatedTopics: ['Vær, (Varsom/NVE - værvarsel) og turens gå/ikke-gå-beslutning', 'Dokumenter, betaling og ambassadefallback']
      },
      {
        id: 'rucking-load-bearing-fitness',
        title: 'Rucking: Lastbæring for beredskap',
        shortSummary: 'Bygg bærekraftig styrke, kondisjon og fottøffhet gjennom systematisk lastbæring - en praktisk treningsmetode for hverdagsberedskap.',
        situationContext: 'Ethvert beredkapsscenario der fysisk kapasitet til å bære forsyninger, evakuere til fots eller opprettholde innsats under belastning kan bli nødvendig - fra en 72-timers sekk til lengre turer eller støtteoppgaver.',
        corePrinciple: 'Rucking (vandring med lastet sekk) er en effektiv måte å bygge generell fysisk beredskap på uten unødvendig belastning på leddene. I motsetning til løping er det bærekraftig på tvers av aldersgrupper, vær og terreng. Det bygger postural styrke, kondisjon, mental robusthet og fottøffhet samtidig.',
        procedureSteps: [
          'Start med en 10-ukers progresjon: begynn med 20 % av kroppsvekten i sekken over 30-minutters turer, 3 ganger per uke. Legg til 5 minutter per økt hver uke.',
          'Sekkoppsett: last vekten nær ryggraden og høyt i sekken. Bruk stive bøker, vektplater eller sandsekker. En dårlig lastet sekk forskyver tyngdepunktet fremover og forårsaker skader.',
          'Fottøy: gå inn nye turgåerstøvler eller annet solid fottøy under opptreningen. Ikke start med nye støvler på en lang økt.',
          'Holdning: oppretthold nøytral ryggrad - ikke len deg for mye fremover. Stram hoftebeltet slik at 60-70 % av lasten hviler på hoftene, ikke skuldrene.',
          'Ernæring og hydrering: innta 500-750 ml vann per time under rucking. Bær en enkel karbohydratkilde (tørket frukt, energigele) for økter over 90 minutter.',
          'Progresjonsmål: nå 30 % kroppsvekt over 10 km på under 2 timer. Dette er et praktisk utholdenhetsmål og et nyttig referansepunkt for hverdagsberedskap.'
        ],
        warnings: [
          'Ikke øk belastning og distanse i samme uke. Progresjon bare én variabel om gangen for å forhindre overbelastningsskader (skinnbeinsbetennelse, plantar fasciitt, IT-båndsyndrom).',
          'Ikke gå tur med rammeløs eller lavkvalitets sekk ved bæring av mer enn 10 kg. Dårlig vektfordeling konsentrerer vekten på å skjære gjennom ved skulder- og lendekontaktpunkter.',
          'Ikke ignorer fotsmerte. Rucking-relaterte fotskader forverres raskt under belastning og kan sette deg ut av spill i uker. Behandle varme flekker før de blir blemmer.',
          'Det er aldri for sent å snu eller søke ly.'
        ],
        relatedTopics: ['Fotskadeforebygging for turgåere, løpere og aktive mennesker', 'Nødovernatting i snø']
      }
    ]
  },
  {
    id: 'egensikkerhet',
    title: 'Egensikkerhet',
    titleEnglish: 'Personal Safety',
    iconName: 'Eye',
    shortDescription: 'Situasjonsforståelse, trusselidentifisering og personlig sikkerhet i hverdagen.',
    philosophy: 'Forebygging av konflikt og vold gjennom proaktiv årvåkenhet og smarte beslutninger.',
    topics: [
      {
        id: 'situational-awareness',
        title: 'Situasjonsforståelse og fokusstyring',
        shortSummary: 'Hvordan trene opp oppmerksomheten for å oppdage trusler før de materialiserer seg.',
        situationContext: 'Navigering i tette urbane områder, ukjente nabolag eller under internasjonale reiser.',
        corePrinciple: 'Ufokusert atferd (f.eks. å se ned i mobilen med støyreduserende hodetelefoner) gjør deg til et lett mål. Aktiv scanning skaper tid og avstand, som er dine viktigste defensive verktøy.',
        procedureSteps: [
          'Praktiser "Cooper-fargeskalaen": Beveg deg i tilstand Gul (avslappet årvåkenhet) der du observerer dine omgivelser, i stedet for tilstand Hvit (helt uoppmerksom).',
          'Scan miljøet i sirkulære mønstre: sjekk hvem som er bak deg, se etter fluktveier og nødutganger i ethvert rom du går inn i.',
          'Etabler en "situasjonell baseline" for stedet du befinner deg. Hva er normal lyd, bevegelse og atferd her? Se etter avvik (anomalier).',
          'Vær oppmerksom på adferdsindikatorer: Personer som matcher din hastighet, unngår blikkontakt men observerer deg intenst, eller forsøker å trenge inn i din personlige sone.',
          'Styr unna blindsoner: Gå med avstand to mørke smug, parkerte varebiler eller uopplyste inngangspartier.'
        ],
        warnings: [
          'IKKE forveksle årvåkenhet med paranoia. Målet er rolig observasjon og situasjonsforståelse, ikke konstant frykt.',
          'IKKE stirr direkte eller konfrontativt på en mistenkelig person; dette kan provosere frem aggresjon eller uønsket oppmerksomhet.',
          'IKKE nøl med å stole på magefølelsen (intuisjonen). Hvis noe føles feil, forlat området umiddelbart uten å rasjonalisere hvorfor.'
        ],
        relatedTopics: ['Konflikthåndtering og deeskalering', 'Urbane trusler']
      },
      {
        id: 'de-escalation-exit-planning',
        title: 'Deeskalering og trygg utgang',
        shortSummary: 'Senk temperaturen i en konflikt samtidig som du bevarer avstand, vitner og fluktmuligheter.',
        situationContext: 'En fremmed, kollega, familiemedlem, ruset person eller folkemengde begynner å eskalere verbalt eller fysisk.',
        corePrinciple: 'Målet er ikke å vinne diskusjonen. Målet er å skape tid, redusere stimulering og komme deg bort med minst mulig risiko.',
        procedureSteps: [
          'Plasser deg slik at du har en utgang bak eller ved siden av deg, ikke direkte bak personen.',
          'Bruk åpne hender, lav stemme, korte setninger og ikke-anklagende formuleringer som "jeg hører deg" eller "jeg går nå".',
          'Gi plass. Gå skrått bort i stedet for rett bakover hvis personen lukker avstanden.',
          'Skap et vitnelag ved å bevege deg mot ansatte, lys, kameraer eller andre trygge voksne.',
          'Hvis personen blokkerer veien, sett grensen tydelig én gang og velg tryggeste tilgjengelige rute ut.',
          'Etterpå: noter tid, sted, beskrivelse, vitner og konkrete trusler mens minnet er ferskt.'
        ],
        warnings: [
          'Ikke speil fornærmelser, trusler eller aggressiv kroppsholdning.',
          'Ikke snu ryggen til før du har nok avstand eller en fysisk barriere.',
          'Ikke la høflighet holde deg fast i en farlig samtale.'
        ],
        relatedTopics: ['Situasjonsforståelse og Fokusstyring', 'Hotellsikkerhet og Rom-Sikring']
      },
      {
        id: 'radikalisering-ekstremisme',
        title: 'Forebygging av radikalisering og ekstremisme',
        shortSummary: 'Hvordan gjenkjenne bekymringsverdige endringer hos ungdom, og samtaleverktøy for forebygging.',
        situationContext: 'Du er bekymret for at et barn, skoleelev eller en ungdom er i ferd med å radikaliseres eller trekkes mot voldelig ekstremisme.',
        corePrinciple: 'Forebygging bygger på tidlig innsats, trygge relasjoner og åpen dialog. Varsling til politi eller hjelpeinstanser gjøres ved konkret bekymring for voldelig adferd eller terrorplanlegging.',
        procedureSteps: [
          'Vær oppmerksom på brå endringer i adferd, vennekrets, språkbruk eller økt interesse for ekstremt innhold.',
          'Etabler en trygg samtale: lytt aktivt uten å fordømme, være nysgjerrig og still åpne spørsmål.',
          'Bruk samtaleverktøy for å utfordre ekstreme holdninger fremfor å gå i direkte diskusjon.',
          'Samarbeid med skole, barnehage, helsestasjon eller forebyggende politi ved behov.',
          'Ved konkret og akutt bekymring for voldshandlinger, kontakt politiet umiddelbart på 02800 eller 112.'
        ],
        warnings: [
          'IKKE konfronter eller anklag personen direkte; det kan føre til isolasjon og ytterligere radikalisering.',
          'IKKE del eller spre ekstremistisk materiale eller propaganda videre, selv ikke for å advare andre.',
          'IKKE nøl med å søke profesjonell rådgivning hvis du føler at situasjonen er utenfor din kontroll.'
        ],
        relatedTopics: ['situational-awareness', 'de-escalation-exit-planning']
      }
    ]
  },
  {
    id: 'egenberedskap',
    title: 'Egenberedskap',
    titleEnglish: 'Household Preparedness',
    iconName: 'Home',
    shortDescription: 'Beredskap i hjemmet, sikring av bolig og infrastruktur, smarthjem og kriseforberedelser.',
    philosophy: 'Praktisk planlegging og tilrettelegging på familie- og husholdningsnivå for å takle bortfall av samfunnskritiske tjenester.',
    topics: [
      {
        id: 'flood-home-prep',
        title: 'Flomsikring av hjemmet og flomrespons',
        shortSummary: 'Hvordan forberede boligen og handle riktig når vannet plutselig stiger.',
        situationContext: 'Bolig i risikoområder under ekstremvær, kraftig snøsmelting eller styrtregn.',
        corePrinciple: 'Forebygging av vanninntrenging krever proaktive fysiske barrierer, mens flomrespons krever rask evakuering langs trygge og kjente ruter.',
        procedureSteps: [
          'Rengjør takrenner, avløp og drensrør regelmessig for å sikre fri vannvei unna husets fundament.',
          'Installer tilbakeslagsventil på avløpsrøret i kjelleren for å hindre at kloakk og vann presses opp i slukene.',
          'Klargjør sandsekker eller mobile flombarrierer for å sperre lave dører, kjellervindu og lufteventiler.',
          'Ved akutt flomfare: Flytt verdisaker, elektronikk og dokumenter opp i andre etasje eller høyere.',
          'Koble ut sikringer for kretser som kan bli oversvømt for å forhindre dødelige strømstøt og elektrisk brann.',
          'Under evakuering med bil: Kjør alltid på veiens "krone" (midten av veien der det er grunnest), og kjør ALDRI gjennom ukjent vannfall som strømmer over veien.'
        ],
        warnings: [
          'IKKE gå ned i en kjeller som allerede er fylt med vann; vannet kan være strømførende eller plutselig fylles opp til taket slik at du stenses inne.',
          'IKKE undervurder vannstrømmen på veier; så lite som 30 cm med rennende vann kan feie en personbil av veien.',
          'IKKE start tørking av en flomskadet kjeller uten å ha dokumentert og fotografert alt grundig av hensyn til forsikringsoppgjøret.'
        ],
        relatedTopics: ['Strømbrudd og nødstrøm', 'Sikring av IoT-enheter']
      },
      {
        id: 'iot-router-security',
        title: 'Sikring av smarthjem og wifi-ruter',
        shortSummary: 'Hvordan isolere IoT-enheter og beskytte nettverket i hjemmet mot cyberangrep.',
        situationContext: 'Oppsett av hjemmenettverk med smarte kameraer, ruter og tilkoblede dingser.',
        corePrinciple: 'Many IoT-enheter leveres med dårlig sikkerhet og brukes som inngangsport til private PC-er. Isolasjon og sterke passord sikrer ditt digitale hjem.',
        procedureSteps: [
          'Endre standard logg-inn og passord på WiFi-ruteren din umiddelbart ved oppsett.',
          'Aktiver et eget "Gjestenettverk" (Guest Network) på ruteren, og koble alle smarthjem-enheter (robotestøvsugere, kameraer, lyspærer) utelukkende til dette nettet.',
          'Deaktiver UPnP (Universal Plug and Play) og WPS på ruteren for å hindre uautorisert åpning av eksterne porter.',
          'Skru av fjernstyring av ruteren fra internett (Disable Remote Management).',
          'Sjekk jevnlig etter fastvare-oppdateringer (firmware) for ruteren din, eller sett den på automatisk oppdatering.'
        ],
        warnings: [
          'IKKE la smarte sikkerhetskameraer peke mot sensitive private områder som soverom eller tastaturer der du taster passord.',
          'IKKE koble en såkalt "sikker" eller anonym burner-telefon til ditt faste private hjemmenettverk; dette kompromitterer dens anonymitet.'
        ],
        relatedTopics: ['Personvern i nettleseren', 'burner-telefon oppsett og bruk']
      },
      {
        id: 'one-week-blackout-communication',
        title: 'én uke strømbrudd og krisekommunikasjon',
        shortSummary: 'Forbered bortfall av strøm, vann, betaling og mobilnett uten å bli avhengig av én sårbar kanal.',
        situationContext: 'Langvarig strømbrudd, cyberhendelse, ekstremvær eller regional infrastruktursvikt påvirker normale tjenester.',
        corePrinciple: 'En robust husholdning er basert på flere lag: vann, varme, mat, medisiner, informasjon, betaling og nabohjelp må fungere også når appene ikke gjør det.',
        procedureSteps: [
          'Lagre rundt 20 liter drikkevann per person og roter det etter en enkel kalender.',
          'Ha mat som tåler romtemperatur, manuell boksåpner, trygg kokemulighet og drivstoff tilpasset boligen.',
          'Skriv ned nødnumre, kommunens informasjonskanaler, familiekontakter og møtested på papir.',
          'Ha kontanter i små sedler og avklar hvordan husholdningen kjøper nødvendigheter hvis kortterminaler er nede.',
          'Bruk batteriradio til offisiell informasjon og spar mobil til korte statusmeldinger.',
          'Lag en naboplan: hvem trenger hjelp med medisiner, mobilitet, barn, dyr, lading eller informasjon. Bli kjent med naboene dine før krisen inntreffer.'
        ],
        warnings: [
          'Ikke bruk grill, gassvarmer eller aggregat innendørs eller på lukket balkong.',
          'Ikke drikk ubehandlet overflatevann uten riktig filtrering og desinfisering.',
          'Ikke vent til strømmen går før du finner ut hvor kommunen publiserer kriseinformasjon.'
        ],
        relatedTopics: ['HLR, hjertestarter og nødvarsling', 'Sikring av Smarthjem og WiFi-ruter']
      },
      {
        id: 'jodtabletter-atomberedskap',
        title: 'Jodtabletter og atomberedskap i hjemmet',
        shortSummary: 'Riktig lagring og dosering av jodtabletter ved atomulykker, samt generelle råd for strålevern.',
        situationContext: 'Offentlig varsling melder om en atomulykke med utslipp av radioaktivt jod, og myndighetene anbefaler befolkningen å ta jodtabletter.',
        corePrinciple: 'Jodtabletter (kaliumjodid) beskytter kun mot radioaktivt jod og forebygger skjoldbruskkjertelkreft. De må kun tas etter direkte anbefaling fra myndighetene.',
        procedureSteps: [
          'Sørg for å ha jodtabletter (Jodix) lagret lett tilgjengelig hjemme for alle familiemedlemmer under 40 år, gravide og ammende.',
          'Hold deg innendørs, lukk alle vinduer og dører, og slå av ventilasjonsanlegg umiddelbart for å unngå innånding av radioaktivt støv.',
          'Følg offisiell informasjon via NRK P1, krisinfo.no eller DSA nettsider.',
          'Ta tablettene kun når myndighetene (DSA) gir beskjed om det, og følg doseringsanvisningen for ulike aldersgrupper nøyaktig.',
          'Ha nok hermetikk og flaskevann lagret for å unngå inntak av forurenset mat og drikke utenfra.'
        ],
        warnings: [
          'IKKE ta jodtabletter forebyggende før utslippet har skjedd, eller uten myndighetenes eksplisitte beskjed.',
          'IKKE forveksle kosttilskudd med jod (som har mikro-doser) med nødtabletter (som har høye doser kaliumjodid).',
          'IKKE forlat boligen eller prøv å hente barn på skolen hvis det har gått ut varsel om å holde seg innendørs.'
        ],
        relatedTopics: ['one-week-blackout-communication', 'flood-home-prep']
      },
      {
        id: 'emergency-prep-72h',
        title: '72-timers (3-dagers) basis egenberedskap',
        shortSummary: 'De mest kritiske forsyningene og rutinene for å klare husholdningen i de første tre dagene av en krisesituasjon.',
        situationContext: 'Plutselig bortfall av strøm, vann eller varme på grunn av uvær, teknisk svikt eller eksterne hendelser.',
        corePrinciple: 'Fokuser på de mest grunnleggende fysiologiske behovene: vann, mat, varme, kommunikasjon og førstehjelp.',
        procedureSteps: [
          'Vann: Lagre 9 liter drikkevann per person (3 liter per dag i 3 dager) på et mørkt og kjølig sted i rene beholdere.',
          'Mat: Sørg for å ha et 3-dagers lager med mat som tåler romtemperatur, krever minimalt med vann og ikke må kokes.',
          'Kommunikasjon: Ha en batteridrevet eller sveivbar DAB/FM-radio for å motta offisiell informasjon via NRK P1.',
          'Varme: Klargjør varme klær, tepper og soveposer. Sjekk ventilasjon hvis du bruker gass- eller parafinovn.',
          'Førstehjelp: Sørg for å ha et basis førstehjelpssett og minst 3 dagers forbruk av dine faste, livsviktige medisiner.',
          'Kontanter: Ha en viss mengde kontanter i små sedler liggende i tilfelle betalingsterminaler og minibanker er nede.'
        ],
        warnings: [
          'IKKE stol på at mobilnettet, internett eller bankkort fungerer under et regionalt strømbrudd.',
          'IKKE drikk vann fra springen hvis det er mistanke om forurensning eller bortfall av trykk; bruk det lagrede vannet.',
          'IKKE bruk kullgrill, gassvarmer eller aggregat innendørs eller på lukket balkong på grunn av fare for kullosforgiftning.'
        ],
        relatedTopics: ['one-week-blackout-communication', 'flood-home-prep']
      },
      {
        id: 'emergency-prep-7day',
        title: '7-dagers utvidet egenberedskap (1 uke)',
        shortSummary: 'Et utvidet beredskapsnivå i tråd med myndighetenes nye anbefalinger om å klare seg selv i en hel uke.',
        situationContext: 'Langvarig strømbrudd, større forsyningssvikt, cyberangrep mot infrastruktur eller isolasjon på grunn av ekstremvær.',
        corePrinciple: 'Langsiktig robusthet i husholdningen kan bygges gjennom alternativ oppvarming, trygg vannrensing, nødhygiene og nabosamarbeid.',
        procedureSteps: [
          'Vann: Lagre minst 21 liter vann per person (3 liter per dag i 7 dager), rotert årlig, og ha enkle verktøy for vannrensing.',
          'Mat: Ha mat for 7 dager og et trygt kokeapparat (f.eks. stormkjøkken) med nok brensel.',
          'Oppvarming: Sørg for alternativ oppvarming (f.eks. vedovn eller godkjent parafinovn) og kontroller at røyk- og CO-varsler virker.',
          'Strøm: Hold nødladere fulladet, ha billader klar, og lær deg strømsparing på mobiltelefonen.',
          'Medisinsk: Ha jodtabletter (Jodix) lagret og tilgjengelig for alle familiemedlemmer under 40 år, gravide og ammende.',
          'Hygiene: Ha en tørrdoløsning klar (kraftige plastposer, bøtte, våtservietter og desinfeksjon) for å håndtere avfall hvis vannet stenges.',
          'Samfunn: Lag en naboplan: kartlegg hvem som trenger spesiell hjelp, og samarbeid om deling av kokeutstyr, radio og varme.'
        ],
        warnings: [
          'IKKE vent på at myndighetene skal dele ut mat og vann de første 7 dagene av en stor krise; ta aktivt ansvar selv.',
          'IKKE drikk overflatevann fra bekker eller innsjøer uten grundig filtrering og koking først.',
          'IKKE ignorer hygiene under langvarig vannbortfall; mangel på renslighet kan raskt føre til spredning av sykdommer.'
        ],
        relatedTopics: ['one-week-blackout-communication', 'jodtabletter-atomberedskap']
      }
    ]
  },
  {
    id: 'personvern',
    title: 'Personvern',
    titleEnglish: 'Digital Privacy',
    iconName: 'ShieldAlert',
    shortDescription: 'Beskyttelse av personlige data, privat kommunikasjon og sensitive situasjoner.',
    philosophy: 'Personvern er en grunnleggende menneskerettighet, og gode personvernrutiner kan redusere risiko i sårbare situasjoner.',
    topics: [
      {
        id: 'burner-phone-sop',
        title: 'Burner-telefon (kontantkort-telefon): Oppsett og bruk',
        shortSummary: 'Standard prosedyre for innkjøp, oppsett og bruk av en isolert og anonym telefon.',
        situationContext: 'Behov for totalt uovervåket kommunikasjon (f.eks. for kildebeskyttelse, sensitiv aktivisme eller flukt fra partnervold).',
        corePrinciple: 'En "burner" telefon mister all verdi hvis den på noe tidspunkt kobles til din virkelige identitet, ditt hjemmenettverk, eller befinner seg i nærheten av din personlige telefon.',
        procedureSteps: [
          'Kjøp en billig telefon (gjerne en enkel "dum" telefon) og et kontantkort på en butikk med kontanter. Unngå steder der du må registrere ID (som i Norge; benytt eSIM eller uregistrerte reise-SIM).',
          'Kjøp telefonen og SIM-kortet på steder uten massiv kameraovervåking, og la din personlige telefon ligge igjen hjemme (slått helt av) under innkjøpet.',
          'Slå kun på burner-telefonen når du er i et geografisk område du ellers ikke oppholder deg i (ikke hjemme eller på jobb).',
          'Bruk kun krypterte og personvernfokuserte applikasjoner (f.eks. Signal, registrert med et anonymt nummer).',
          'Slå telefonen helt av og ta ut batteriet (hvis mulig), eller plasser den i en skjermet Faraday-pose (signalblokkeringspose) når den ikke er i aktiv bruk.'
        ],
        warnings: [
          'IKKE slå på burner-telefonen og din personlige mobiltelefon på samme sted eller til samme tid. Det kan koble enhetene sammen i mobilnettleverandørenes registre.',
          'IKKE logg inn på dine personlige kontoer (Facebook, e-post, bank osv.) på en brennerenhet.',
          'IKKE ring eller send SMS til kontakter som kjenner ditt virkelige navn uten kryptering eller anonymisering av stemme/innhold.'
        ],
        relatedTopics: ['VPN: Teori og Praksis', 'Personvern ved vold i nære relasjoner']
      },
      {
        id: 'domestic-violence-privacy',
        title: 'Digital sikkerhet ved kontrollerende partnere',
        shortSummary: 'Veiledning særskilt tilpasset personer i kontrollerende eller voldelige parforhold for trygg kommunikasjon og planlegging av utvei.',
        situationContext: 'Pasienten/brukeren lever i frykt for overvåking og søker en sikker digital fluktrute eller kommunikasjon med krisesentre.',
        corePrinciple: 'Sikkerhet og forsiktighet er viktigere enn hastverk. Unngå spor som kan trigge motreaksjoner, og hold din hemmelige kommunikasjonskanal helt separat.',
        procedureSteps: [
          'Bruk en nøytral, ikke-overvåket enhet hvis tilgjengelig (f.eks. en PC på det offentlige biblioteket eller en telefon lånt av en nabo) for å søke etter hjelp.',
          'Sett nettleseren din i "Privat modus" (Incognito) hver gang du søker, men husk at dette kun sletter lokal søkehistorikk, ikke nettverkslogger. Slett nettleserdata manuelt uansett.',
          'Opprett en hemmelig e-postadresse (f.eks. på ProtonMail) med et fiktivt navn, og aldri logg inn på denne på enheter partneren din har fysisk tilgang til.',
          'Installer hemmelige applikasjoner skjult i mapper med kjedelige navn (f.eks. "Kalkulator" eller "System verktøy") hvis enheten din er under oppsyn.',
          'Bruk en trygg "exit-knapp" eller ha en rask fane åpen (f.eks. yr.no) som du kan svitsje til umiddelbart om partneren kommer uventet inn i rommet.'
        ],
        warnings: [
          'IKKE endre passord eller slet all søkehistorikk plutselig hvis partneren din følger tett med på enheten. En brå endring i atferd eller en unormalt ren historikk kan skape unødig mistanke.',
          'IKKE stol blindt på at slettede meldinger på en felles telefon er borte; mange enheter synkroniserer automatisk til nettskyen der partneren kan logge inn.',
          'IKKE bruk en burner-telefon du har gjemt i huset til å ringe krisesenteret hvis du ikke er 100% sikker på at partneren din er langt unna; vibrasjon og lys kan lett avsløre gjemmestedet.'
        ],
        relatedTopics: ['burner-telefon oppsett og bruk', 'Situasjonsforståelse og Fokusstyring']
      },
      {
        id: 'device-permission-audit',
        title: 'Mobiltilganger og kontoaudit',
        shortSummary: 'Reduser daglig sporing ved å stramme inn tillatelser, skyøkter, delte kontoer og gjenopprettingskanaler.',
        situationContext: 'Månedlig personvernvedlikehold, etter samlivsbrudd, før reise eller når du mistenker uønsket tilgang til kontoene dine.',
        corePrinciple: 'Mest privat dataeksponering kommer fra vanlige bekvemmelighetsvalg: fast stedstilgang, delt sky, svake gjenopprettinger og apper med for mange rettigheter.',
        procedureSteps: [
          'Gå gjennom stedstillatelser og sett de fleste apper til "kun ved bruk" eller "aldri".',
          'Fjern ukjente enheter og gamle økter fra operativsystem-, sky-, sosiale medier-, bank- og e-postkontoer.',
          'Flytt viktige passord til passordbehandler og erstatt gjenbrukte passord med unike.',
          'Aktiver appbasert tofaktor på e-post, bank, skylagring og meldingsapper.',
          'Revider delte album, kalendere, familielokasjon, Bluetooth-sporere og smarthjem-tilganger.',
          'Ta offline-kopi av viktige dokumenter før større kontoendringer.'
        ],
        warnings: [
          'Ikke gjør plutselige synlige personvernendringer hvis du overvåkes av en voldelig partner; planlegg med hjelpetjeneste først.',
          'Ikke stol på inkognitomodus som anonymitet. Den skjuler hovedsakelig lokal nettleserhistorikk.',
          'Ikke la kontogjenoppretting være knyttet til e-post eller telefonnummer andre kan lese.'
        ],
        relatedTopics: ['Digital Sikkerhet ved Kontrollerende Partnere', 'Sikring av Smarthjem og WiFi-ruter']
      }
    ]
  },
  {
    id: 'reisesikkerhet',
    title: 'Reisesikkerhet',
    titleEnglish: 'Travel Resilience',
    iconName: 'Plane',
    shortDescription: 'Sikkerhet på reise, svindelavsløring, hotellsikring og risikohåndtering utlandet.',
    philosophy: 'Reiseresiliens kombinerer dyp kulturell forståelse med universelle personlige sikkerhetsprinsipper.',
    topics: [
      {
        id: 'cuba-baby-milk-scam',
        title: 'Svindel med morsmelkerstatning (Cuba og Latin-Amerika)',
        shortSummary: 'Hvordan kjenne igjen en vanlig svindel der noen prøver å få deg til å kjøpe et bestemt produkt.',
        situationContext: 'Turist blir kontaktet av en fortvilet mor med et lite spedbarn i gaten eller nær en matbutikk.',
        corePrinciple: 'Svindlere spiller på medfølelse og tidspress for å få turister til å kjøpe varer som senere leveres tilbake for kontanter.',
        procedureSteps: [
          'Moren ber ikke om penger, men ber deg i stedet kjøpe en spesifikk boks med morsmelkerstatning i en utvalgt butikk rett rundt hjørnet.',
          'Når du går inn i butikken, viser det seg ofte at prisen er svært høy for boksen.',
          'Etter at du har betalt og forlatt stedet, blir boksen returnert og pengene deles mellom de som står bak svindelen.',
          'Gjenkjenn faresignalet: En person som bare vil at du skal kjøpe i én bestemt butikk og ikke tar imot annen hjelp.'
        ],
        warnings: [
          'IKKE la deg rive med av kraftige emosjonelle scener i gata. Ta et skritt tilbake og vurder dynamikken objektivt.',
          'IKKE gå inn på bakrom eller ukjente smug sammen med gatselgere for å hente varer eller "bedre priser".',
          'IKKE opptre fiendtlig hvis du oppdager svindelen; smil høflig, rist på hodet ("No, gracias") og fortsett å gå uten å stoppe.'
        ],
        relatedTopics: ['Situasjonsforståelse og Fokusstyring', 'Valutasikkerhet og kontanthåndtering']
      },
      {
        id: 'hotel-room-security',
        title: 'Hotellsikkerhet og rom-sikring',
        shortSummary: 'Sikring av hotellrommet mot uautorisert adgang og tyveri av sensitive eiendeler.',
        situationContext: 'Innsjekking og opphold på hotell i utlandet, spesielt i ustabile områder eller storbyer.',
        corePrinciple: 'De fleste dørlåser på hotell kan enkelt forbigås av uærlige ansatte eller profesjonelle tyver. Enkle mekaniske barrierer skaper trygghet.',
        procedureSteps: [
          'Be om et rom mellom 2. og 6. etasje om mulig. Dette er høyt nok til å unngå enkle innbrudd fra gatenivå, men lavt nok til å nås av brannvesenets stiger.',
          'Lås døren fysisk med kjetting eller svinglås med en gang du går inn på rommet.',
          'Bruk en enkel gummi dørkile under døren på innsiden om natten for å blokkere uautorisert åpning selv om vedkommende har nøkkelkort.',
          'La TV-en eller radioen stå på med lavt volum og sett "Vennligst ikke forstyrr"-skiltet på døra når du forlater rommet for å gi inntrykk av at noen er til stede.',
          'Oppbevar pass og backup-midler i safen, men legg en gjenstand du garantert ikke glemmer (f.eks. venstre sko) i safen for å sikre at du husker innholdet ved utsjekk.'
        ],
        warnings: [
          'IKKE diskuter romnummeret ditt høyt i lobbyen eller baren slik at fremmede kan høre det.',
          'IKKE åpne døren for uventede "hotellansatte" eller "vedlikeholdsarbeidere" uten å ringe resepsjonen først for å verifisere oppdraget.',
          'IKKE stol på at kodesafen på rommet er uknuselig. Mange safer har standard fabrikk-koder (som 000000 eller 123456) som hotellledelsen aldri har endret.'
        ],
        relatedTopics: ['Valutasikkerhet og kontanthåndtering', 'Digital Sikkerhet ved Kontrollerende Partnere']
      },
      {
        id: 'document-money-redundancy',
        title: 'Dokumenter, betaling og ambassadefallback',
        shortSummary: 'Bygg redundans for pass, forsikring, penger, resepter og offisiell hjelp før reisen går galt.',
        situationContext: 'Internasjonal reise der tyveri, sykdom, grenseforsinkelse, uro, sperret kort eller tapt telefon kan sette deg fast.',
        corePrinciple: 'Reiserobusthet er separasjon. én bag, én telefon, ett bankkort eller én skykonto må aldri bli alt du har.',
        procedureSteps: [
          'Ha pass, ID-kopi, reiseforsikring, resepter og bookingreferanser tilgjengelig både offline og på papir.',
          'Del betalingsmidler mellom kropp, dagsekk og hotellsafe; ha litt lokal valuta eller bredt akseptert valuta.',
          'Noter ambassade/konsulat og UDs krisenummer før avreise.',
          'Del reiserute, overnatting og transportplan med en pålitelig kontakt hjemme.',
          'Bruk nødinfo på låseskjerm med fornavn, blodtype hvis kjent, allergier og nødkontakt.',
          'Ved ran: prioriter fysisk sikkerhet, politirapport, kortsperring, ambassade og erstatningsdokumenter i den rekkefølgen.'
        ],
        warnings: [
          'Ikke lagre alle dokumentkopier kun på telefonen som kan bli stjålet.',
          'Ikke bær alle kort og kontanter i samme lommebok.',
          'Ikke publiser sanntidsinformasjon om hotell, fly eller rute offentlig mens du fortsatt er på reisen.'
        ],
        relatedTopics: ['Hotellsikkerhet og Rom-Sikring', 'Situasjonsforståelse og Fokusstyring']
      }
    ]
  }
];

// ============================================================================
// SCENARIOS SYSTEMS (EN / NO)
// ============================================================================

export const scenariosDataEn: Scenario[] = [
  {
    id: 'commute-incident',
    title: 'Urban Blackout and Rush Hour Chaos',
    description: 'A sudden and cumulative power outage strikes the metro system while you are isolated inside a crowded subterranean station. Strains of group panic arise.',
    pillar: 'egensikkerhet',
    initialStepId: 'start',
    successOutcome: 'You stayed calm, avoided the crowd flow, and guided a vulnerable commuter to safe ground. Excellent judgment!',
    failureOutcome: 'You surrendered to the crowd momentum, lost visibility of escape structures, and became trapped in the crush. You survived with minor contusions, but this represents a failure of focus mapping.',
    steps: {
      start: {
        text: 'The ceiling lights cut out instantly, and digital screens die. The metro train brakes abruptly, locking you inside the tunnel near the platform deck. Passive commuters begin shoving and screaming. What is your reaction?',
        choices: [
          {
            text: 'Draw your mobile device and apply active noise-canceling headphones to survey web-news lines.',
            nextStepId: 'loss-of-awareness',
            feedback: 'Critical error. You disconnect key ambient acoustic indicators and alienate focus from immediate physical hazards.',
            scoreChange: -20
          },
          {
            text: 'Slide laterally out of the pedestrian stream, anchor your back firmly against a structural column, and actively scan the layout.',
            nextStepId: 'safe-wall-position',
            feedback: 'Strong choice! Taking a stable position improves your view of exits and problems.',
            scoreChange: 30
          },
          {
            text: 'Shout loudly to command order and suppress group panic.',
            nextStepId: 'provoke-panic',
            feedback: 'Ineffective. Uncontrolled vocalizations can spark localized stress vectors and draw hostile attention to yourself.',
            scoreChange: -10
          }
        ]
      },
      'loss-of-awareness': {
        text: 'While locking focus on your dead screen, a blinded passenger trips and crashes heavily into you. You stumble and are knocked flat onto the concrete path.',
        choices: [
          {
            text: 'Scramble up, push past bodies aggressively, and bolt toward the exit light.',
            nextStepId: 'crowd-stampede',
            feedback: 'Dangerous. Shoving blind into a dense crowd during stampedes invites high-rate crushing hazards.',
            scoreChange: -30
          },
          {
            text: 'Roll onto your flank, adopt a fetal posture with forearm skull blocks, and locate a calm structure after the wave passes.',
            nextStepId: 'recover-on-floor',
            feedback: 'Solid defensive maneuver. This reduces physical vulnerability to extreme trampling vectors.',
            scoreChange: 10
          }
        ]
      },
      'safe-wall-position': {
        text: 'From your anchored vantage point, dim emergency indicator bulbs flicker on. A tight bottleneck is throttling the main staircase. Nearby, you notice a half-open staff service door. A disoriented older woman falls near you.',
        choices: [
          {
            text: 'Bypass the fallen woman and slip swiftly through the staff door to secure personal safety.',
            nextStepId: 'selfish-escape',
            feedback: 'You evacuated safely, but abandoned a defenseless subject in high-hazard grids. Basic civic cohesion failed.',
            scoreChange: -10
          },
          {
            text: 'Support the woman up, address her in a calm, authoritative cadence ("Hold my arm, we evacuate here"), and guide her through the service door.',
            nextStepId: 'noble-escape',
            feedback: 'Strong civic leadership! You successfully turned awareness into collective safety.',
            scoreChange: 40
          }
        ]
      },
      'provoke-panic': {
        text: 'Your yelling irritates an aggressive, highly-stressed commuter close by. He shoves you violently, accusing you of inciting panic.',
        choices: [
          {
            text: 'Shove back violently to assert dominance and command space.',
            nextStepId: 'confrontation',
            feedback: 'Extremely volatile. Hand-to-hand altercations in unlit, crowded crisis sectors are highly unpredictable and dangerous.',
            scoreChange: -40
          },
          {
            text: 'Raise your hands open-palmed, lower your register, and state: "Apologies, I am here to help. Let us focus on exiting safely."',
            nextStepId: 'safe-wall-position',
            feedback: 'Superb de-escalation! You successfully diffused the hazard and restored your environmental awareness.',
            scoreChange: 20
          }
        ]
      },
      'crowd-stampede': {
        text: 'You are swept and pinned firmly inside the stairwell choke. Airway pressure increases, and you lose all manual control over your body. You failed to retain personal safety.',
        choices: []
      },
      'recover-on-floor': {
        text: 'As the crowd surge thins, you stand up carefully. You have lost your gear pack, but remain intact. You spot the staff door sitting unlatched.',
        choices: [
          {
            text: 'Quickly slide through the service exit to secure safety.',
            nextStepId: 'noble-escape',
            feedback: 'You successfully emerge onto secure ground.',
            scoreChange: 10
          }
        ]
      },
      'selfish-escape': {
        text: 'You emerge onto street level. The city grid is pitch dark, but you are physically secure. Personal guilt persists.',
        choices: []
      },
      'noble-escape': {
        text: 'Accompanied by the older commuter, you emerge calmly and orderly into the daylight at street level, clear of the underground surge.',
        choices: []
      },
      confrontation: {
        text: 'A physical struggle erupts. You both tumble over the dark platform margin, falling onto the active rail tracks below. This ended catastrophically.',
        choices: []
      }
    }
  },
  {
    id: 'burner-setup',
    title: 'Burner Phone Setup and Use',
    description: 'You must urgently set up a private communication channel to coordinate leaving a dangerous domestic situation without alerting a controlling co-habitant.',
    pillar: 'personvern',
    initialStepId: 'start',
    successOutcome: 'You completed procurement, setup, and storage without leaving digital footprints, signal logs, or physical indicators. Strong privacy discipline!',
    failureOutcome: 'You executed critical missteps that linked your hardware or signal logs to your identity or allowed physical discovery. Your communications window is closed.',
    steps: {
      start: {
        text: 'You have resolved to acquire a burner device. Your partner is currently asleep. How do you design your purchase scheme?',
        choices: [
          {
            text: 'Search web marketplaces for cheap handsets on your home PC, and message a local seller to arrange pick-up tomorrow.',
            nextStepId: 'online-leak',
            feedback: 'Fatal failure. Search queries are easily audited by controlling household members, immediately betraying your intent.',
            scoreChange: -30
          },
          {
            text: 'Wait for the subject to depart for work. Turn your primary phone completely off, leave it at home, transit to a distant retail sector, and use cash.',
            nextStepId: 'cash-purchase',
            feedback: 'Good privacy discipline! Turning off your active phone reduces tower log matching, and cash avoids bank records.',
            scoreChange: 40
          }
        ]
      },
      'online-leak': {
        text: 'Your partner wakes and audits PC history or automated router logs. He demands to know why you are researching burner setups.',
        choices: []
      },
      'cash-purchase': {
        text: 'You secured a basic feature phone and cash SIM. You are at a cafe 5 kilometers away. How do you construct the activation?',
        choices: [
          {
            text: 'Connect to the shop\'s public Wi-Fi, and sign into your real personal email account to load backup software caches.',
            nextStepId: 'compromised-account',
            feedback: 'Fatal security error. Personal email authorization instantly links the burner\'s hardware serials (IMEI/IMSI) to your real identity.',
            scoreChange: -40
          },
          {
            text: 'Boot on baseline cellular data (never Wi-Fi), create a fresh email under a pseudonym, and instantiate Signal using the new number.',
            nextStepId: 'secure-setup',
            feedback: 'Exquisite precision! The new device and line are completely insulated from your real-world identity.',
            scoreChange: 45
          }
        ]
      },
      'compromised-account': {
        text: 'Logging directly into a real personal account tripped a 2-factor login query on your primary handset and updated your cloud dashboard. Your new line is compromised.',
        choices: []
      },
      'secure-setup': {
        text: 'The phone is active and sterile. You must transit back to the household. How do you store and run the device?',
        choices: [
          {
            text: 'Power off entirely, wrap the device inside an RF-blocking Faraday foil pocket, and conceal it in a bag inside the garage.',
            nextStepId: 'noble-success',
            feedback: 'Good discipline! This reduces passive tower tracking and makes physical inspection less useful.',
            scoreChange: 40
          },
          {
            text: 'Conceal it active in silent vibration mode beneath your bed, allowing you to quickly monitor inbound crisis support chats.',
            nextStepId: 'discovered-home',
            feedback: 'Unacceptable hazard. Active devices emit RF signal data, connect to local cells, and might throw screen lighting inside dark bedrooms.',
            scoreChange: -30
          }
        ]
      },
      'discovered-home': {
        text: 'While you are showering, the device screen lights up to deliver a cellular service update. Your partner spots the glow in the dark and finds the stash.',
        choices: []
      },
      'noble-success': {
        text: 'You have deployed a completely secure, sterile line. You can now coordinate support and logistics safe from surveillance.',
        choices: []
      }
    }
  }
];

export const scenariosDataNo: Scenario[] = [
  {
    id: 'commute-incident',
    title: 'Urbant strømbrudd og kaos i rushtiden',
    description: 'Et plutselig og totalt strømbrudd rammer kollektivnettet i storbyen mens du sitter fast på en fullpakket undergrunnsstasjon. Det oppstår antydning til panikk.',
    pillar: 'egensikkerhet',
    initialStepId: 'start',
    successOutcome: 'Du klarte å beholde roen, proaktivt navigere deg ut av panikkområdet ved hjelp av din situasjonsforståelse, og hjelpe en medreisende i sikkerhet uten å utsette deg selv for fare. Fremragende innsats!',
    failureOutcome: 'Du lot deg rive med av den generelle panikken, mistet oversikten over fluktveier og ble sittende fast i trengselen. Heldigvis kom du unna med bare skrubbsår, men situasjonen kunne vært unngått med bedre fokusstyring.',
    steps: {
      start: {
        text: 'Lyset slukkes brått, og de elektroniske skiltene dør. T-banen stopper med et rykk inne i tunnelen nær perrongen. Folk begynner å dingle med mobilene, dytte for å komme fram, og stemningen oppleves trengende. Hva gjør du?',
        choices: [
          {
            text: 'Trekk frem mobiltelefonen og støyreduserende hodetelefoner for å sjekke nyhetene mens du venter på beskjed.',
            nextStepId: 'loss-of-awareness',
            feedback: 'Feil. Du stenger ute viktige auditive signaler og fjerner oppmerksomheten fra dine umiddelbare omgivelser.',
            scoreChange: -20
          },
          {
            text: 'Trekk deg rolig sidelengs ut av strømmen av folk, still deg med ryggen mot en solid vegg og skann rommet etter nødutganger og reaksjoner.',
            nextStepId: 'safe-wall-position',
            feedback: 'Riktig! Ved å sikre ryggen din får du full oversikt over baselinen og kan observere utviklingen i fred.',
            scoreChange: 30
          },
          {
            text: 'Rop høyt at alle må ta det rolig for å stoppe tilløp til panikk.',
            nextStepId: 'provoke-panic',
            feedback: 'Middels. Roping kan faktisk øke stressnivået til de rundt deg og rette uønsket oppmerksomhet mot deg.',
            scoreChange: -10
          }
        ]
      },
      'loss-of-awareness': {
        text: 'Mens du stirrer på mobilen (som ikke har dekning), snubler en person i mørket og faller rett over deg. Du mister balansen og faller mot det harde betonggulvet i trengselen.',
        choices: [
          {
            text: 'Reis deg raskt opp, skyv unna folk og ban deg vei mot lyset ved utgangen uansett hva.',
            nextStepId: 'crowd-stampede',
            feedback: 'Farlig. Å presse seg blindt inn i en stresset menneskemengde øker risikoen for å bli trampet ned.',
            scoreChange: -30
          },
          {
            text: 'Rull over på siden, beskytt hodet med armene (fosterstilling) til den verste dyttebølgen har passert, og søk etter et rolig holdepunkt.',
            nextStepId: 'recover-on-floor',
            feedback: 'Bra defensiv manøver. Du minimerer skaderisikoen under akutt trengsel.',
            scoreChange: 10
          }
        ]
      },
      'safe-wall-position': {
        text: 'Fra din trygge posisjon ser du at nødlysene slår seg på med svak glød. Det danner seg en flaskehals ved hovedtrappen. Like ved oppdager du en mindre beferdet personalutgang som står halvåpen. En eldre dame snubler nær deg.',
        choices: [
          {
            text: 'Ignorer damen og smutt raskt inn personalutgangen for å sikre din egen fluktvei.',
            nextStepId: 'selfish-escape',
            feedback: 'Du kom deg ut, men etterlot en sårbar person i faresonen. Solidaritetsprinsippet i beredskap sviktet.',
            scoreChange: -10
          },
          {
            text: 'Ta tak i damen, snakk til henne med en rolig og bestemt stemme ("Følg meg, vi går ut her"), og led henne kontrollert gjennom personalutgangen.',
            nextStepId: 'noble-escape',
            feedback: 'Utmerket lederskap! Du brukte din trygghet til å redde en annen på en effektiv og strukturert måte.',
            scoreChange: 40
          }
        ]
      },
      'provoke-panic': {
        text: 'Ropingen din irriterer en stresset mann i nærheten, som dytter hardt til deg og anklager deg for å skape unødig frykt. Atmosfæren blir amper.',
        choices: [
          {
            text: 'Dytt tilbake for å vise autoritet og forhindre at han tar kontroll over situasjonen.',
            nextStepId: 'confrontation',
            feedback: 'Farlig. Voldelig eskalering i mørket under en krisetilstand er ekstremt uforutsigbart.',
            scoreChange: -40
          },
          {
            text: 'Hev hendene rolig med åpne håndflater, senk stemmen og si "Beklager, jeg ville bare hjelpe. Let oss samarbeide om å finne veien ut."',
            nextStepId: 'safe-wall-position',
            feedback: 'Utmerket deeskalering! Du roet gemyttene og gjenopprettet fokus.',
            scoreChange: 20
          }
        ]
      },
      'crowd-stampede': {
        text: 'Du blir klemt fast i trappeløpet. Pusten blir tung, og du innser at du har null kontroll over bevegelsene dine. Du har feilet i å ivareta egen sikkerhet.',
        choices: []
      },
      'recover-on-floor': {
        text: 'Når den verste dyttingen gir seg, reiser du deg rolig opp. Du har mistet sekken, men er fysisk uskadet. Du ser personalutgangen halvåpen.',
        choices: [
          {
            text: 'Smett raskt gjennom utgangen før de andre oppdager den.',
            nextStepId: 'noble-escape',
            feedback: 'Du kommer deg ut i sikkerhet.',
            scoreChange: 10
          }
        ]
      },
      'selfish-escape': {
        text: 'Du kommer deg helskinnet opp på gatenivå. Byen er mørkelagt, men du er fysisk trygg. Likevel gnager samvittigheten.',
        choices: []
      },
      'noble-escape': {
        text: 'Sammen med den eldre damen kommer du deg trygt og rolig opp i dagslyset på gatenivå, unna panikken under bakken.',
        choices: []
      },
      confrontation: {
        text: 'Slagsmål bryter ut. Dere faller begge over perrongkanten i mørket og lander stygt på sporet. Dette endte katastrofalt.',
        choices: []
      }
    }
  },
  {
    id: 'burner-setup',
    title: 'Anskaffelse og bruk av burner-telefon',
    description: 'Du er i en sensitiv situasjon der du raskt må opprette en sikker, uovervåket kanal til et eksternt krisemottak, uten at din kontrollerende partner oppdager det.',
    pillar: 'personvern',
    initialStepId: 'start',
    successOutcome: 'Du klarte å gjennomføre innkjøp og oppsett av en medlemsfordel fullstendig anonym kommunikasjonskanal uten å legge igjen digitale eller fysiske spor. Din strategiske tålmodighet og presisjon har sikret din trygghet.',
    failureOutcome: 'Du gjorde kritiske feil som koblet burner-telefonen til din virkelige identitet eller avslørte gjemmestedet for partneren din. Sikkerheten er kompromittert.',
    steps: {
      start: {
        text: 'Du har bestemt deg for å anskaffe en burner-telefon. Partneren din sover. Hvordan planlegger du innkjøpet?',
        choices: [
          {
            text: 'Søk på nett etter billige brukte telefoner på personlig PC, og betal ham for å hente den i morgen.',
            nextStepId: 'online-leak',
            feedback: 'Kritisk feil. Søkehistorikken din kan lett overvåkes, og partneren din vil oppdage planen.',
            scoreChange: -30
          },
          {
            text: 'Vent til partneren din er på jobb. La din vanlige mobil ligge igjen hjemme (slått helt av) og gå til en butikk langt unna for å kjøpe en rimelig kontanttelefon med kontanter.',
            nextStepId: 'cash-purchase',
            feedback: 'Godt valg. Å slå av den vanlige mobilen reduserer spor i mobilnettet, og kontanter etterlater færre digitale spor.',
            scoreChange: 40
          }
        ]
      },
      'online-leak': {
        text: 'Partneren din våkner og sjekker ruter-loggen eller PC-historikken din. Han konfronterer deg med hvorfor du søker etter billige anonyme mobiler.',
        choices: []
      },
      'cash-purchase': {
        text: 'Du har kjøpt en enkel telefon og et SIM-kort med kontanter. Du sitter på en kafé 5 kilometer hjemmefra. Hva gjør du nå for å sette den opp?',
        choices: [
          {
            text: 'Koble telefonen til kafeens åpne WiFi, logg kjapt på din personlige e-postkonto for å laste ned Signal-appen.',
            nextStepId: 'compromised-account',
            feedback: 'Feil. Innlogging på en personlig e-postkonto kobler umiddelbart brennerenhetens IMEI- og IMSI-nummer direkte til din virkelige identitet.',
            scoreChange: -40
          },
          {
            text: 'Sett inn SIM-kortet, slå på telefonen ved bruk av mobildataen på SIM-kortet (ikke WiFi), opprett en helt ny, fiktiv e-postadresse og registrer Signal ved hjelp av det nye anonyme nummeret.',
            nextStepId: 'secure-setup',
            feedback: 'Eksepsjonell presisjon! Kanalen er hermetisk isolert fra dine virkelige kontoer.',
            scoreChange: 45
          }
        ]
      },
      'compromised-account': {
        text: 'E-postinnloggingen utløste en 2FA-notifikasjon på din gamle enhet og logget den nye enheten i kontodashbordet. Identiteten din er avslørt.',
        choices: []
      },
      'secure-setup': {
        text: 'Enheten er klar og testet. Du må nå reise hjem til huset der partneren din oppholder seg. Hvordan oppbevarer og bruker du telefonen hjemme?',
        choices: [
          {
            text: 'Slå telefonen helt av, og legg den i en skjermet Faraday-pose (eller pakk den godt inn i aluminiumsfolie) i bunnen av en sekk i garasjen. Aldri slå den på hjemme.',
            nextStepId: 'noble-success',
            feedback: 'Perfekt disiplin! Dette forhindrer all mast-logging nær hjemmet ditt og fysisk oppdagelse.',
            scoreChange: 40
          },
          {
            text: 'Gjem den slått på i lydløs modus under sengen, slik at du raskt kan høre om det tikker inn en melding fra krisesenteret.',
            nextStepId: 'discovered-home',
            feedback: 'Farlig. Enheten kan avgi skjermlys i mørket eller logges på nærliggende nettverkstjenester, noe som øker risikoen for oppdagelse betraktelig.',
            scoreChange: -30
          }
        ]
      },
      'discovered-home': {
        text: 'Mens du dusjer slår telefonen seg på med et svakt lys på grunn av en nettverksmelding. Partneren din hører en svak summetone under sengen og finner enheten.',
        choices: []
      },
      'noble-success': {
        text: 'Du har etablert en 100% sikker livslinje. Du kan nå koordinere bistand fra et trygt, eksternt sted uten å etterlate spor.',
        choices: []
      }
    }
  }
];


// ============================================================================
// CHECKLISTS SYSTEMS (EN / NO)
// ============================================================================

export const checklistsDataEn: ChecklistGroup[] = [
  {
    id: 'emergency-72h',
    title: '72-Hour Basic Preparedness',
    icon: 'Home',
    items: [
      { id: 'water-3d', text: 'Water: At least 9 liters of clean drinking water per person (3 liters per day for 3 days)', checked: false, category: 'water' },
      { id: 'food-3d', text: 'Food: 3 days of non-perishable, ready-to-eat food requiring no cooking or refrigeration', checked: false, category: 'food' },
      { id: 'radio-3d', text: 'Radio: Battery-powered or hand-crank DAB/FM radio tuned to NRK P1', checked: false, category: 'comm' },
      { id: 'light-3d', text: 'Light: Flashlights/headlamps, spare batteries, and matches or lighters', checked: false, category: 'light' },
      { id: 'firstaid-3d', text: 'First Aid: Basic medical kit, wound dressing, and critical personal medications', checked: false, category: 'medical' },
      { id: 'cash-3d', text: 'Cash: A small stash of cash in small banknotes', checked: false, category: 'cash' },
      { id: 'warmth-3d', text: 'Warmth: Warm clothing, blankets, and windproof outer layers ready', checked: false, category: 'heat' },
      { id: 'hygiene-3d', text: 'Hygiene: Wet wipes, hand sanitizer, and garbage bags for emergency sanitation', checked: false, category: 'hygiene' }
    ]
  },
  {
    id: 'emergency-7day',
    title: '7-Day Advanced Preparedness (1 Week)',
    icon: 'Home',
    items: [
      { id: 'water-7d', text: 'Water: At least 21 liters of clean water per person (3 liters per day for 7 days) stored cool and dark', checked: false, category: 'water' },
      { id: 'food-7d', text: 'Food: 7 days of dry/canned food and a safe camping stove (stormkjøkken) with fuel', checked: false, category: 'food' },
      { id: 'heat-7d', text: 'Heating: Safe alternative heat source (wood stove, paraffin/gas heater) and checked CO alarm', checked: false, category: 'heat' },
      { id: 'power-7d', text: 'Power: Charged power banks, a car phone charger, and a battery-saving device protocol', checked: false, category: 'power' },
      { id: 'iodine-7d', text: 'Iodine: Potassium iodide tablets (Jodix) for members under 40, pregnant, or breastfeeding', checked: false, category: 'medical' },
      { id: 'info-7d', text: 'Communication: Written plan on paper with emergency numbers, local meeting points, and contact list', checked: false, category: 'comm' },
      { id: 'hygiene-7d', text: 'Sanitation: Dry toilet setup (heavy waste bags, bucket liner, disinfectant) and extra toilet paper', checked: false, category: 'hygiene' },
      { id: 'community-7d', text: 'Community: Neighbor coordination plan to check on vulnerable individuals and share resources', checked: false, category: 'safety' },
      { id: 'maintenance-7d', text: 'Maintenance: Monthly routine scheduled to rotate stored water and check battery charges', checked: false, category: 'safety' }
    ]
  },
  {
    id: 'urban-first-aid-kit',
    title: 'Urban First Aid Kit (IFAK + Home Cache)',
    icon: 'Shield',
    items: [
      { id: 'ifak-tourniquet', text: 'Carry one approved windlass tourniquet (CAT or SOFTT-W) and practice one-hand application.', checked: false, category: 'medical' },
      { id: 'ifak-hemostatic-gauze', text: 'Include hemostatic gauze (QuikClot/Celox) for deep bleeding control and wound packing.', checked: false, category: 'medical' },
      { id: 'ifak-pressure-bandage', text: 'Pack one pressure bandage (Israeli or equivalent) for sustained compression after packing.', checked: false, category: 'medical' },
      { id: 'ifak-chest-seals', text: 'Add vented chest seals (pair) for penetrating torso injury response.', checked: false, category: 'medical' },
      { id: 'ifak-gloves', text: 'Store at least 2 pairs of nitrile gloves to reduce contamination risk during treatment.', checked: false, category: 'medical' },
      { id: 'ifak-trauma-shears', text: 'Include trauma shears for rapid clothing access and scene-speed intervention.', checked: false, category: 'medical' },
      { id: 'ifak-cpr-mask', text: 'Carry a compact CPR barrier mask for safer rescue breathing scenarios.', checked: false, category: 'medical' },
      { id: 'ifak-marker', text: 'Add a permanent marker to note tourniquet time and key handoff information.', checked: false, category: 'medical' },
      { id: 'ifak-thermal-blanket', text: 'Pack a thermal blanket to reduce post-trauma heat loss while awaiting EMS.', checked: false, category: 'medical' },
      { id: 'ifak-maintenance', text: 'Run monthly expiration and seal checks; replace used/expired components immediately.', checked: false, category: 'safety' }
    ]
  },
  {
    id: 'travel-safety',
    title: 'International Travel Preparedness',
    icon: 'Plane',
    items: [
      { id: 'passport-val', text: 'Verify that your passport remains officially valid for at least 6 months past your travel arrival index', checked: false, category: 'docs' },
      { id: 'insurance-pdf', text: 'Store localized PDF travel insurance policy files offline and keep a durable physical printout', checked: false, category: 'docs' },
      { id: 'cash-split', text: 'Decentralize funds: distribute debit cards and banknotes across 3 discrete real-world points (pouch, bag, safe)', checked: false, category: 'payment' },
      { id: 'itinerary-share', text: 'Transmit deep travel plans, hotel listings, and transport indicators to one reliable primary contact home', checked: false, category: 'safety' },
      { id: 'emergency-numbers', text: 'Program direct phone lines for home embassies and the Ministry of Foreign Affairs emergency helpline (+47 23 95 00 00)', checked: false, category: 'safety' },
      { id: 'biometric-off', text: 'Temporarily switch off FaceID and biometric access protocols at border crossings (enforce strong PIN entry)', checked: false, category: 'privacy' }
    ]
  },
  {
    id: 'digital-privacy-audit',
    title: 'Monthly Security and Privacy Audit',
    icon: 'Shield',
    items: [
      { id: 'pwd-mgr', text: 'Shed shared cloud credentials and migrate all accounts into a secure, decentralized password manager (Bitwarden)', checked: false, category: 'accounts' },
      { id: '2fa-enable', text: 'Configure robust app-based two-factor authentication with export/backup support (for example Aegis, Ente Auth, or 2FAS) wherever possible', checked: false, category: 'accounts' },
      { id: 'app-perms', text: 'Audit application access lists: revoke persistent location permissions, background audio mic access, and address lists', checked: false, category: 'device' },
      { id: 'router-check', text: 'Log into the residential router, upgrade outdated firmware, and verify UPnP and passive WPS remain disabled', checked: false, category: 'network' },
      { id: 'vpn-always', text: 'Enforce "Always-On" VPN security layers on mobile devices whenever linking with open public Wi-Fi cells', checked: false, category: 'network' }
    ]
  }
];

export const checklistsDataNo: ChecklistGroup[] = [
  {
    id: 'emergency-72h',
    title: '72-timers (3-dagers) basis egenberedskap',
    icon: 'Home',
    items: [
      { id: 'water-3d', text: 'Vann: Minst 9 liter rent drikkevann per person (3 liter per dag i 3 dager)', checked: false, category: 'water' },
      { id: 'food-3d', text: 'Mat: 3 dagers lager med mat som tåler romtemperatur og ikke krever koking', checked: false, category: 'food' },
      { id: 'radio-3d', text: 'Radio: Batteridrevet eller sveivbar DAB/FM-radio innstilt på NRK P1', checked: false, category: 'comm' },
      { id: 'light-3d', text: 'Lys: Lommelykter/hodelykter, ekstra batterier og fyrstikker eller lighter', checked: false, category: 'light' },
      { id: 'firstaid-3d', text: 'Førstehjelp: Basis førstehjelpsutstyr, sårbehandling og dine faste medisiner', checked: false, category: 'medical' },
      { id: 'cash-3d', text: 'Kontanter: En viss mengde kontanter i små sedler', checked: false, category: 'cash' },
      { id: 'warmth-3d', text: 'Varme: Varme klær, ulltepper, soveposer og vindtette ytterklær klargjort', checked: false, category: 'heat' },
      { id: 'hygiene-3d', text: 'Hygiene: Våtservietter, hånddesinfeksjon og avfallsposer for nødsanitær', checked: false, category: 'hygiene' }
    ]
  },
  {
    id: 'emergency-7day',
    title: '7-dagers utvidet egenberedskap (1 uke)',
    icon: 'Home',
    items: [
      { id: 'water-7d', text: 'Vann: Minst 21 liter rent drikkevann per person (3 liter per dag i 7 dager) lagret mørkt og kjølig', checked: false, category: 'water' },
      { id: 'food-7d', text: 'Mat: Mat for 7 dager og et trygt kokeapparat (stormkjøkken/gassbrenner) med nok brensel', checked: false, category: 'food' },
      { id: 'heat-7d', text: 'Varme: Trygg alternativ varmekilde (vedovn, parafinovn) og fungerende CO-varsler', checked: false, category: 'heat' },
      { id: 'power-7d', text: 'Strøm: Fulladede nødladere, billader til mobil og etablert strømsparingsrutine', checked: false, category: 'power' },
      { id: 'iodine-7d', text: 'Jod: Jodtabletter (Jodix) lagret for alle under 40 år, gravide og ammende', checked: false, category: 'medical' },
      { id: 'info-7d', text: 'Kriseplan: Skriftlig plan med nødnumre, kommunens infopunkt og kontaktliste på papir', checked: false, category: 'comm' },
      { id: 'hygiene-7d', text: 'Sanitær: Tørrdoløsning klar (bøtte, plastposer, sanitærvæske) samt rikelig med toalettpapir', checked: false, category: 'hygiene' },
      { id: 'community-7d', text: 'Nabosamarbeid: Plan for å sjekke sårbare naboer og dele på ressurser (koking/varme)', checked: false, category: 'safety' },
      { id: 'maintenance-7d', text: 'Vedlikehold: Fast månedlig rutine for å rotere vann, sjekke nødladere og utstyrsstatus', checked: false, category: 'safety' }
    ]
  },
  {
    id: 'urban-first-aid-kit',
    title: 'Personlig førstehjelpskit for hverdagsbruk (IFAK + hjemmelager)',
    icon: 'Shield',
    items: [
      { id: 'ifak-tourniquet', text: 'Ha en godkjent windlass-tourniquet (CAT eller SOFTT-W) og tren på bruk med én hånd.', checked: false, category: 'medical' },
      { id: 'ifak-hemostatic-gauze', text: 'Inkluder hemostatisk kompress (QuikClot/Celox) for dyp blodningskontroll og pakking.', checked: false, category: 'medical' },
      { id: 'ifak-pressure-bandage', text: 'Pakk en trykkbandasje (Israeli eller tilsvarende) for varig kompresjon etter pakking.', checked: false, category: 'medical' },
      { id: 'ifak-chest-seals', text: 'Legg til ventilerte chest seals (par) for penetrerende brystskade.', checked: false, category: 'medical' },
      { id: 'ifak-gloves', text: 'Lagre minst 2 par nitrilhansker for å redusere kontamineringsrisiko under behandling. Smitte kan skje begge veier.', checked: false, category: 'medical' },
      { id: 'ifak-trauma-shears', text: 'Inkluder traumesaks for rask tilgang gjennom klær ved tidskritisk innsats.', checked: false, category: 'medical' },
      { id: 'ifak-cpr-mask', text: 'Ha en kompakt HLR-barrieremaske for tryggere innblåsninger.', checked: false, category: 'medical' },
      { id: 'ifak-marker', text: 'Legg til permanent tusj for å notere tourniquet-tid og handoff-info.', checked: false, category: 'medical' },
      { id: 'ifak-thermal-blanket', text: 'Pakk varmeteppe for å redusere varmetap etter traume mens man venter på hjelp.', checked: false, category: 'medical' },
      { id: 'ifak-maintenance', text: 'Kjør månedlig sjekk av ventiler og forseglinger, og erstatt brukt eller utgått innhold så snart som mulig.', checked: false, category: 'safety' }
    ]
  },
  {
    id: 'travel-safety',
    title: 'Internasjonal reisesikkerhet',
    icon: 'Plane',
    items: [
      { id: 'passport-val', text: 'Sjekk at passet er gyldig i minst 6 måneder etter hjemreisedato', checked: false, category: 'docs' },
      { id: 'insurance-pdf', text: 'Lagre kopi av reiseforsikringsbeviset offline på mobilen og skriv ut fysisk', checked: false, category: 'docs' },
      { id: 'cash-split', text: 'Del opp reisekassa: oppbevar kort/kontanter på tre ulike steder (lomme, sekk, safe)', checked: false, category: 'payment' },
      { id: 'itinerary-share', text: 'Del reiseruten og hotelladresser med minst én pålitelig kontakt hjemme', checked: false, category: 'safety' },
      { id: 'emergency-numbers', text: 'Lagre nummeret til UD (Utenriksdepartementets krisepunkt: +47 23 95 00 00) og lokal ambassade', checked: false, category: 'safety' },
      { id: 'biometric-off', text: 'Deaktiver ansikts- og fingeravtrykk-opplåsing på flyplasser/grenseoverganger (krever kun PIN)', checked: false, category: 'privacy' }
    ]
  },
  {
    id: 'digital-privacy-audit',
    title: 'Månedlig gjennomgang av personvern og digital sikkerhet',
    icon: 'Shield',
    items: [
      { id: 'pwd-mgr', text: 'Aktiver og flytt alle passord til en desentralisert passordbehandler (f.eks. Bitwarden)', checked: false, category: 'accounts' },
      { id: '2fa-enable', text: 'Aktiver tofaktorautentisering (2FA) med app som støtter eksport/backup, for eksempel Aegis, Ente Auth eller 2FAS, på alle viktige kontoer', checked: false, category: 'accounts' },
      { id: 'app-perms', text: 'Gå gjennom app-tillatelser på mobilen: fjern stedstilgang, mikrofon og kontakter for apper som ikke trenger det', checked: false, category: 'device' },
      { id: 'router-check', text: 'Sjekk at ruteren hjemme har siste fastvareoppdatering og at UPnP er deaktivert', checked: false, category: 'network' },
      { id: 'vpn-always', text: 'Sett VPN til å kjøre automatisk ("Always-on") på mobilen ved tilkobling til usikre WiFi-nettverk', checked: false, category: 'network' }
    ]
  }
];
