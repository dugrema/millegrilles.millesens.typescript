# getUserDevices method

The getUserDevices method is defined under app/workers/connection.worker.ts.

# Devices and deviceGroups mapping to DeviceReadings

The appareil array contains individual DeviceReadings types from connection.worker.ts. A device is a combination of data from senseurs, types_donnees and configuration in DeviceReadings.

The devicesStore data can be otained from configuration and types_donnes. The senseurs content will be used to populate deviceValueStore.

Appareil = deviceGroup

## Sample responses
{
  "ok": true,
  "appareils": [
    {
      "uuid_appareil": "rpi-pico-e6614104033e722b",
      "instance_id": "c7b011ea-5891-4f15-812f-de15718cd328",
      "csr_present": false,
      "senseurs": {
        "DHT11_p28/humidite": {
          "timestamp": 1765310143,
          "type": "humidite",
          "valeur": 35
        },
        "DHT11_p28/temperature": {
          "timestamp": 1765310143,
          "type": "temperature",
          "valeur": 22
        },
        "bmp180/pression": {
          "timestamp": 1765310143,
          "type": "pression",
          "valeur": 1006
        },
        "bmp180/pression_tendance_05m": {
          "timestamp": 1765310143,
          "type": "pression_tendance",
          "valeur": -4
        },
        "bmp180/pression_tendance_10m": {
          "timestamp": 1765310143,
          "type": "pression_tendance"
        },
        "bmp180/pression_tendance_15m": {
          "timestamp": 1765310143,
          "type": "pression_tendance"
        },
        "bmp180/pression_tendance_30m": {
          "timestamp": 1765310143,
          "type": "pression_tendance"
        },
        "bmp180/pression_tendance_60m": {
          "timestamp": 1765310143,
          "type": "pression_tendance"
        },
        "bmp180/pression_tendance_90m": {
          "timestamp": 1765310143,
          "type": "pression_tendance"
        },
        "bmp180/temperature": {
          "timestamp": 1765310143,
          "type": "temperature",
          "valeur": 21.5
        },
        "rp2picow/temperature": {
          "timestamp": 1765310160,
          "type": "temperature",
          "valeur": 23.8
        },
        "rp2picow/wifi": {
          "timestamp": 1765310160,
          "type": "ip",
          "valeur_str": "192.168.2.175"
        },
        "switch_p18/etat": {
          "timestamp": 1765310160,
          "type": "switch",
          "valeur": 0
        },
        "switch_p19/etat": {
          "timestamp": 1765310160,
          "type": "switch",
          "valeur": 0
        }
      },
      "derniere_lecture": 1765310160,
      "configuration": {
        "descriptif": "Pico DEV",
        "cacher_senseurs": [
          "bmp180/pression_tendance_05m",
          "bmp180/pression_tendance_10m",
          "bmp180/pression_tendance_15m"
        ],
        "descriptif_senseurs": {
          "switch_p18/etat": "Switch 1",
          "switch_p19/etat": "Switch 2"
        },
        "programmes": {
          "ad11f330-acdd-11f0-a2ae-6be90284d6f0": {
            "programme_id": "ad11f330-acdd-11f0-a2ae-6be90284d6f0",
            "class": "programmes.horaire.HoraireHebdomadaire",
            "descriptif": "Test 1",
            "actif": true,
            "args": {
              "switches": [
                "switch_p18/etat"
              ],
              "activationInitiale": false,
              "horaire": [
                {
                  "etat": 1,
                  "heure": 14,
                  "jour": "",
                  "minute": 0,
                  "solaire": "sunset"
                },
                {
                  "etat": 0,
                  "heure": 14,
                  "jour": "",
                  "minute": 5,
                  "solaire": "dusk"
                },
                {
                  "etat": 1,
                  "heure": 8,
                  "jour": 2,
                  "minute": 10,
                  "solaire": "dawn"
                },
                {
                  "etat": 1,
                  "heure": 8,
                  "jour": 2,
                  "minute": 30,
                  "solaire": "sunrise"
                },
                {
                  "etat": 1,
                  "heure": 14,
                  "jour": 1,
                  "minute": 54
                },
                {
                  "etat": 0,
                  "heure": 14,
                  "jour": 1,
                  "minute": 56
                },
                {
                  "etat": 1,
                  "heure": 8,
                  "jour": 0,
                  "minute": 0
                }
              ]
            }
          }
        }
      },
      "displays": [
        {
          "name": "Ssd1306",
          "format": "text",
          "height": 4,
          "width": 16
        }
      ],
      "types_donnees": {
        "bmp180/temperature": "temperature",
        "bmp180/pression_tendance_10m": "pression_tendance",
        "DHT11_p28/temperature": "temperature",
        "bmp180/pression_tendance_60m": "pression_tendance",
        "rp2picow/temperature": "temperature",
        "bmp180/pression_tendance_15m": "pression_tendance",
        "switch_p18/etat": "switch",
        "switch_p19/etat": "switch",
        "rp2picow/wifi": "ip",
        "bmp180/pression_tendance_90m": "pression_tendance",
        "DHT11_p28/humidite": "humidite",
        "bmp180/pression_tendance_30m": "pression_tendance",
        "bmp180/pression": "pression",
        "bmp180/pression_tendance_05m": "pression_tendance"
      },
      "connecte": false
    }
  ],
  "instance_id": "c7b011ea-5891-4f15-812f-de15718cd328"
}

## Message: lectureConfirmee

This message contains a partial update for a deviceGroup (DeviceReadings). 

Note that the deviceGroup information is incomplete, only the device values should be updated.
Also the device `connected` status should be set to true for the deviceGroup and devices present in this messages as this message implies they are connected.

{
  "exchange": "2.prive",
  "routingKey": "evenement.SenseursPassifs.z2i3XjxMrp4r8nvXhGUfys97cbFUZ5jj5VwN1p8A9AS4VVWSggG.lectureConfirmee",
  "message": {
    "uuid_appareil": "rpi-pico-e6614104033e722b",
    "instance_id": "c7b011ea-5891-4f15-812f-de15718cd328",
    "user_id": "z2i3XjxMrp4r8nvXhGUfys97cbFUZ5jj5VwN1p8A9AS4VVWSggG",
    "senseurs": {
      "DHT11_p28/humidite": {
        "timestamp": 1765816603,
        "type": "humidite",
        "valeur": 35
      },
      "DHT11_p28/temperature": {
        "timestamp": 1765816603,
        "type": "temperature",
        "valeur": 21
      },
      "bmp180/pression": {
        "timestamp": 1765816603,
        "type": "pression",
        "valeur": 1015
      },
      "bmp180/pression_tendance_05m": {
        "timestamp": 1765816603,
        "type": "pression_tendance",
        "valeur": -3
      },
      "bmp180/pression_tendance_10m": {
        "timestamp": 1765816603,
        "type": "pression_tendance",
        "valeur": -5
      },
      "bmp180/pression_tendance_15m": {
        "timestamp": 1765816603,
        "type": "pression_tendance",
        "valeur": -13
      },
      "bmp180/pression_tendance_30m": {
        "timestamp": 1765816603,
        "type": "pression_tendance",
        "valeur": -56
      },
      "bmp180/pression_tendance_60m": {
        "timestamp": 1765816603,
        "type": "pression_tendance",
        "valeur": -113
      },
      "bmp180/pression_tendance_90m": {
        "timestamp": 1765816603,
        "type": "pression_tendance",
        "valeur": -131
      },
      "bmp180/temperature": {
        "timestamp": 1765816603,
        "type": "temperature",
        "valeur": 20.6
      },
      "rp2picow/temperature": {
        "timestamp": 1765816603,
        "type": "temperature",
        "valeur": 23.3
      },
      "rp2picow/wifi": {
        "timestamp": 1765816603,
        "type": "ip",
        "valeur_str": "192.168.2.175"
      },
      "switch_p18/etat": {
        "timestamp": 1765816603,
        "type": "switch",
        "valeur": 0
      },
      "switch_p19/etat": {
        "timestamp": 1765816603,
        "type": "switch",
        "valeur": 0
      }
    },
    "derniere_lecture": 1765816603
  }
}
