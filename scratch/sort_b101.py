import os
import shutil
import sys

# Reconfigure stdout to use utf-8 to prevent encoding errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"C:\00 DEV\In Progress\beredskap101-content-lab"

categories = {
    "1_foerstehjelp": [
        "førstehjelp", "first aid", "first-aid", "feet", "f2", "livredning", "bleeding", "cpr", "aed",
        "choking", "heat-stroke", "heteslag", "anaphylaxis", "allergic", "seizure", "poisoning", "trauma",
        "injury", "accident", "wound", "allergic", " livreddende"
    ],
    "2_friluftsliv": [
        "friluftsliv", "wilderness", "bushcraft", "outdoor", "elver", "hytter-og-huler", "snø", "rucking",
        "ninja", "scouting", "patrolling", "fire-starting", "stream-crossing", "mountain", "alpine",
        "desert", "arctic", "foraging", "map", "compass", "navigation", "lost situation", "altitude",
        "hypothermia", "hypotermi", "cold", "frostbite", "climbing", "hiking", "river", "crevasse"
    ],
    "3_egensikkerhet": [
        "egensikkerhet", "situational", "personal safety", "situasjonsbevissthet", "situasjonsforståelse",
        "de-escalation", "deeskalering", "vold", "tilstedeværelse", "spilleregler", "insider", "terror",
        "radikalisering", "ekstremisme", "bekymret", "bekymring", "samtaleverktøy", "dialog", "barnehagemiljø",
        "skolemiljø", "self-defense", "cooper", "vulnerable", "conflict", "confrontation", "abuse"
    ],
    "4_egenberedskap": [
        "egenberedskap", "blackout", "strømbrudd", "vannlagring", "iot", "router", "wifi", "garage", "drivstoff",
        "flom", "storm", "tsunami", "skred", "overvann", "egenberedskapskasse", "beredskapskasse", "beredskapslager",
        "beredskapsmat", "kriseprodukter", "jodtabletter", "flyalarmen", "tilfluktsrom", "sikringstiltak",
        "kontinuitetsveileder", "kontinuitetsplanlegging", "samfunnssikkerhet", "ros", "risikoanalyse", "risikostyring",
        "outage", "generator", "utility", "batteri", "heat-source", "heating", "cooling", "fire safety",
        "detector", "escape", "levee", "water damage", "power", "mre", "drikkevann"
    ],
    "5_personvern": [
        "personvern", "privacy", "opsec", "burner", "kontant", "kontantkort", "anonymity", "surveillance", "overvåkning", "skjermbruk",
        "burner phone", "kryptogodkjenning", "gdpr", "sporing", "mobile phones", "cyber", "vpn", "anonym",
        "surveill", "passord", "metadata", "encryption"
    ],
    "6_reisesikkerhet": [
        "reisesikkerhet", "travel", "scam", "friendship", "hotel", "airport", "taxi", "embassy", "currency",
        "kontanthåndtering", "valuta", "reisetips", "reisedetaljer", "turist", "uber", "lyft", "key fob",
        "driving", "crash", "roadwork", "fatigue", "distraction", "vehicle", "truck", "bus", "seatbelt",
        "consulate", "itinerary", "scams", "hotels", "passport"
    ],
    "akademisk-forskning": [
        "thesis", "bacheloroppgave", "emergent state", "team resilience", "team dynamics", "group behavior under stress",
        "time is of the essence", "literature review", "panarchies", "vulnerability", "emergent", "coercion", "psychology",
        "adaptation", "conceptualization", "human resource management", "human relations", "frontiers in", "journal of",
        "research", "threats to team", "individual biological", "adversity", "bastian", "gucciardi", "bakker", "aguinis",
        "bowers", "burke", "chapman", "driskell", "salas", "flint-taylor", "lanzetta", "roma", "bedwell", "taylor",
        "webster", "watson", "cooper", "freedman", "frankl", "man's search", "hard things", "steve magness",
        "cheap fights", "three dangerous men", "strategy a history", "book of ninja", "discipline of teams",
        "scout mindset", "online anonymity", "fixing your feet", "bytes, bombs", "hidden hand", "clive hamilton",
        "magic weapons"
    ],
    "myndighets-veiledere": [
        "nsm", "dsb", "ses", "nsw", "government", "embassy", "police", "politiet", "krisar og alvorlege",
        "lov om", "sikkerhetsklarering", "personellsikkerhet", "autorisasjon", "e-doktrine", "trusselvurdering",
        "trussel", "hybride", "kildekritisk", "red cross", "readyplan", "rediplan", "national assistance card",
        "vulnerable people", "disaster", "recovery", "authority", "state-storm", "keeping your animals", "aider",
        "veileder-om", "nasjonal sikkerhetsstrategi", "samfunnssikkerhet i ein", "totalberedskapsmeldingen",
        "kystverket", "varsom", "varsel", "regobs", "nve", "nødvarsel", "flyalarmen", "tilskudd", "pst",
        "etterretning", "sikresiden", "forebyggende", "materiell _", "tiltakskort", "skjema_helhetlig",
        "veiledning til planer", "retningslinjer", "instruks"
    ],
    "kurs-opplæring": [
        "instruktørkurs", "undervisning", "opplæring", "metode", "spill", "gruppearbeid", "lær om", "velkommen",
        "kunnskapsspill", "materiell _", "kurssenteret", "spontaneous volunteer", "strategic volunteer", "uib 2025",
        "uis", "autorisasjon", "roller", "opplæring"
    ],
    "prosjektdokumenter": [
        "outline", "overview", "prompt", "brief", "website-builder", "project_overview", "content_outline",
        "metadata.json", "manifest"
    ]
}

# Create directories
for cat in categories.keys():
    os.makedirs(os.path.join(src_dir, cat), exist_ok=True)

# Helper list of all files/directories in beredskap101-content-lab to ignore
ignored_names = set(categories.keys())
ignored_names.update([".git", ".github", ".agents", ".claude", ".gitignore", "processed-content", "uorganisert"])

items = os.listdir(src_dir)
moved_count = 0
unmatched_count = 0

os.makedirs(os.path.join(src_dir, "uorganisert"), exist_ok=True)

for item in items:
    if item in ignored_names or item.startswith("."):
        continue
    
    item_lower = item.lower()
    matched_cat = None
    
    # Try to find matching category by checking keywords
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in item_lower:
                matched_cat = cat
                break
        if matched_cat:
            break
            
    # Default fallback
    if not matched_cat:
        matched_cat = "uorganisert"
        unmatched_count += 1
    
    src_path = os.path.join(src_dir, item)
    dst_path = os.path.join(src_dir, matched_cat, item)
    
    try:
        shutil.move(src_path, dst_path)
        print(f"Moved: '{item}' -> {matched_cat}/")
        moved_count += 1
    except Exception as e:
        print(f"Error moving: {e}")

print("\n--- Summary ---")
print(f"Total items moved: {moved_count}")
print(f"Items sent to 'uorganisert': {unmatched_count}")
