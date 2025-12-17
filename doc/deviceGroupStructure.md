# Device group structure

This corresponds to what is received on synchronization per device group (appareil).

## Data

{
    "uuid_appareil": "rpi-pico-e661640843895f24",
    "instance_id": "9e295eef-2139-4bbc-a4ff-a10fa613f520",
    "csr_present": false,
    "senseurs": {
        "rp2picow/temperature": {
            "timestamp": 1765973560,
            "type": "temperature",
            "valeur": 27.5
        },
        "rp2picow/wifi": {
            "timestamp": 1765973560,
            "type": "ip",
            "valeur_str": "192.168.2.129"
        },
        "switch_p16/etat": {
            "timestamp": 1765973560,
            "type": "switch",
            "valeur": 0
        },
        "switch_p17/etat": {
            "timestamp": 1765973560,
            "type": "switch",
            "valeur": 1
        }
    },
    "derniere_lecture": 1765973560,
    "configuration": {
        "descriptif": "10 - Russell Salon lumiere",
        "cacher_senseurs": [
            "rp2picow/temperature",
            "rp2picow/wifi"
        ],
        "descriptif_senseurs": {
            "switch_p17/etat": "1. Lumiere fond",
            "switch_p16/etat": "2. Lumieres côtés"
        },
        "displays": {},
        "programmes": {
            "c0234a80-ccc4-11f0-999c-81c852c1e962": {
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
            },
            "4132f5a0-ee39-11ef-ae8c-3bd1cd21f642": {
                "programme_id": "4132f5a0-ee39-11ef-ae8c-3bd1cd21f642",
                "class": "programmes.horaire.HoraireHebdomadaire",
                "descriptif": "Lumières Off",
                "actif": true,
                "args": {
                    "switches": [
                        "switch_p16/etat"
                    ],
                    "activationInitiale": false,
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
            },
            "3baaf420-a18f-11f0-92c7-63a578183cb7": {
                "programme_id": "3baaf420-a18f-11f0-92c7-63a578183cb7",
                "class": "programmes.horaire.HoraireHebdomadaire",
                "descriptif": "Lumière fond semaine",
                "actif": true,
                "args": {
                    "horaire": [
                        {
                            "etat": 1,
                            "heure": 5,
                            "jour": 0,
                            "minute": 27
                        },
                        {
                            "etat": 1,
                            "heure": 5,
                            "jour": 1,
                            "minute": 27
                        },
                        {
                            "etat": 1,
                            "heure": 5,
                            "jour": 2,
                            "minute": 27
                        },
                        {
                            "etat": 1,
                            "heure": 5,
                            "jour": 3,
                            "minute": 27
                        },
                        {
                            "etat": 1,
                            "heure": 5,
                            "jour": 4,
                            "minute": 27
                        }
                    ],
                    "switches": [
                        "switch_p17/etat"
                    ],
                    "activationInitiale": false
                }
            }
        },
        "filtres_senseurs": {
            "switch_p17/etat": [
                "Maison",
                "Maison Switch"
            ],
            "switch_p16/etat": [
                "Maison",
                "Maison Switch"
            ]
        }
    },
    "types_donnees": {
        "switch_p16/etat": "switch",
        "switch_p17/etat": "switch",
        "rp2picow/temperature": "temperature",
        "rp2picow/wifi": "ip"
    },
    "supprime": false,
    "connecte": true,
    "version": "2025.5.54"
}
