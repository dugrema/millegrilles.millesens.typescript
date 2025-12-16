# Different events from a subscription

## Event presenceAppareil

Allows updated all devices in a deviceGroup to connected: true. The attribute `uuid_appareil` maps to `deviceGroup` in the deviceValueStore. This message also implies that `lastUpdate` is now in epoch seconds.

{
  "exchange": "2.prive",
  "routingKey": "evenement.SenseursPassifs.z2i3XjxMrp4r8nvXhGUfys97cbFUZ5jj5VwN1p8A9AS4VVWSggG.presenceAppareil",
  "message": {
    "uuid_appareil": "rpi-pico-e6614103e79a8521",
    "user_id": "z2i3XjxMrp4r8nvXhGUfys97cbFUZ5jj5VwN1p8A9AS4VVWSggG",
    "version": "2025.5.50",
    "connecte": true
  }
}

## Event lectureConfirmee

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
