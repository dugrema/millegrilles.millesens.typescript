# Device group programs

Device groups (appareil) support programs that can be triggered on timers or device values and toggle switches.

## Program structure
Each program is represented by a JSON object containing a set of mandatory fields and an `args` object whose structure depends on the program class. The required top‑level fields are: `programme_id` (UUID string), `class` (fully qualified class name), `descriptif` (human‑readable description), and `actif` (boolean flag indicating whether the program is enabled). The remaining fields are optional and may be present depending on the program class. The `args` object contains the configuration specific to the class.

When identifying sensor devices for reading values, it is possible to access other device groups (appareil) than the current one by prepending the device id with `device group name:`. For example, to access device `TEMP` on device group `GRA`, the sensor is identified as `GRA:TEMP`. When using a same-group sensor reading, identifier `TEMP` is enough.

- **programmes.horaire.HoraireHebdomadaire**:  
  * `activationInitiale` (boolean) – whether the program should execute immediately upon activation.  
  * `switches` (array of string) – device id of the switch devices affected.  
  * `horaire` (array of objects) – each object contains `etat` (0 or 1), `heure` (0‑23), `minute` (0‑59), optional `jour` (0‑6 where 0 is Sunday) and optional `solaire` (values: 'sunset', 'dusk', 'noon', 'dawn', 'sunrise').  

- **programmes.environnement.Humidificateur**:  
  * `humidite` (number) – target humidity percentage.  
  * `precision` (number) – allowed deviation.  
  * `duree_off_min` (number) – duration to keep the humidifier off.  
  * `senseurs_humidite` (array of string) – humidity sensor identifiers.  
  * `switches_humidificateurs` (array of string) – switch identifiers controlling the humidifier.  
  * `duree_on_min` (number) – duration to keep the humidifier on.  

- **programmes.environnement.Chauffage**:  
  * `temperature` (number) – desired temperature set‑point.  
  * `precision` (number) – allowed temperature tolerance.  
  * `duree_off_min` (number) – duration to keep the heating off after turning off.  
  * `senseurs` (array of string) – identifiers of temperature sensors (can include group prefixes).  
  * `switches` (array of string) – identifiers of the heating switches.  
  * `duree_on_min` (number) – duration to keep the heating on after turning on.  

- **programmes.environnement.Climatisation**:  
  * `temperature` (number) – desired temperature set‑point for the air‑conditioner.  
  * `precision` (number) – allowed temperature tolerance.  
  * `duree_off_min` (number) – duration to keep the AC off after turning off.
  * `senseurs` (array of string) – identifiers of temperature sensors.  
  * `switches` (array of string) – identifiers of the AC switches.  
  * `duree_on_min` (number) – duration to keep the AC on after turning on.  

The sample programs section below demonstrates concrete instances of each program type.

## Sample programs

Type **programmes.horaire.HoraireHebdomadaire**.

{
    "programme_id": "c0234a80-ccc4-11f0-999c-81c852c1e962",
    "class": "programmes.horaire.HoraireHebdomadaire",
    "descriptif": "Lumière off fond",
    "actif": true,
    "args": {
        "activationInitiale": false,
        "switches": [
            "switch_p17/etat"
        ],
        "horaire": [
            {
                "etat": 0,
                "heure": 8,
                "minute": 0
            },
            {
                "etat": 0,
                "heure": 21,
                "minute": 30
            }
        ]
    }
}

{
  programme_id: 'ad11f330-acdd-11f0-a2ae-6be90284d6f0',
  'class': 'programmes.horaire.HoraireHebdomadaire',
  descriptif: 'Test 1',
  actif: true,
  args: {
    switches: [
        'switch_p18/etat'
    ],
    activationInitiale: false,
    horaire: [
        {
            etat: 1,
            heure: 14,
            jour: '',
            minute: 0,
            solaire: 'sunset'
        },
        {
            etat: 0,
            heure: 14,
            jour: '',
            minute: 5,
            solaire: 'dusk'
        },
        {
            etat: 1,
            heure: 8,
            jour: 2,
            minute: 10,
            solaire: 'dawn'
        },
        {
            etat: 1,
            heure: 8,
            jour: 2,
            minute: 30,
            solaire: 'sunrise'
        },
        {
            etat: 1,
            heure: 14,
            jour: 1,
            minute: 54
        },
        {
            etat: 0,
            heure: 14,
            jour: 1,
            minute: 56
        },
        {
            etat: 1,
            heure: 8,
            jour: 0,
            minute: 0
        }
    ]
  }
}

Type **programmes.environnement.Humidificateur**.

{
    programme_id: '5c257b20-889c-11ee-9821-6df3ec74fe24',
    'class': 'programmes.environnement.Humidificateur',
    descriptif: 'Humidificateur',
    actif: true,
    args: {
        humidite: 33,
        precision: 1,
        duree_off_min: 60,
        senseurs_humidite: [
            'DHT22_p28/humidite'
        ],
        switches_humidificateurs: [
            'switch_p22/etat'
        ],
        duree_on_min: 120
    }
}

Type **programmes.environnement.Chauffage**.

{
    programme_id: '177475a0-db45-11f0-a42e-cfc86fca9e34',
    'class': 'programmes.environnement.Chauffage',
    descriptif: 'Sample remote sensor',
    actif: true,
    args: {
        temperature: 20,
        precision: 2,
        duree_off_min: 30,
        senseurs: [
            'rpi-pico-e6614103e79a8521:DHT22_p28/temperature'
        ],
        switches: [
            'switch_p19/etat'
        ],
        duree_on_min: 90
    }
}

Type **programmes.environnement.Climatisation**.

{
    programme_id: 'c15fc1f0-db45-11f0-a42e-cfc86fca9e34',
    'class': 'programmes.environnement.Climatisation',
    descriptif: 'Sample AC remote sensor',
    actif: true,
    args: {
        duree_on_min: 90,
        precision: 2,
        duree_off_min: 30,
        senseurs: [
            'rpi-pico-e6614103e79a8521:DHT22_p28/temperature'
        ],
        switches: [
            'switch_p18/etat'
        ],
        temperature: 20
    }
}
