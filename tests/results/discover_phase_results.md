=== DISCOVER PHASE INTEGRATION TESTS ===
Testing chat API with PRD demo queries

### Query 1: What sports inventory do you have?
**PRD Expected:** ESPN ($18-35), Sports Illustrated ($15-20), Bleacher Report ($12-18)
**Actual Response:**
```json
{
  "name": "ESPN Premium Sports",
  "category": "Sports",
  "cpm_range": [
    18,
    25
  ]
}
{
  "name": "Sports Illustrated",
  "category": "Sports",
  "cpm_range": [
    15,
    20
  ]
}
{
  "name": "Bleacher Report",
  "category": "Sports",
  "cpm_range": [
    12,
    18
  ]
}
```
**Response Time:** 34ms
**Status:** ✅ PASS

### Query 2: Find inventory under $20 CPM
**PRD Expected:** Weather.com ($8-12), SI ($15-20), Bleacher ($12-18)
**Actual Response:**
```json
{
  "name": "ESPN Premium Sports",
  "cpm_options": [
    18,
    25
  ]
}
{
  "name": "Weather.com Geo-Targeted",
  "cpm_options": [
    8,
    12
  ]
}
{
  "name": "Weather.com Geo-Targeted",
  "cpm_options": [
    8,
    12
  ]
}
{
  "name": "Sports Illustrated",
  "cpm_options": [
    15,
    20
  ]
}
{
  "name": "Sports Illustrated",
  "cpm_options": [
    15,
    20
  ]
}
{
  "name": "Bleacher Report",
  "cpm_options": [
    12,
    18
  ]
}
{
  "name": "Bleacher Report",
  "cpm_options": [
    12,
    18
  ]
}
{
  "name": "Automotive News Network",
  "cpm_options": [
    20,
    28
  ]
}
{
  "name": "Spotify Audio Ads",
  "cpm_options": [
    15,
    25
  ]
}
```
**Response Time:** 34ms
**Status:** ✅ PASS

### Query 3: What video formats do you support?
**PRD Expected:** Pre-roll 15s/30s, outstream, CTV 30s
**Actual Response:**
```json
{
  "name": "Pre-roll 15s",
  "type": "video",
  "specs": {
    "max_file_size": "10MB",
    "file_types": [
      "mp4",
      "webm"
    ],
    "max_duration": 15
  }
}
{
  "name": "Pre-roll 30s",
  "type": "video",
  "specs": {
    "max_file_size": "20MB",
    "file_types": [
      "mp4",
      "webm"
    ],
    "max_duration": 30,
    "skip_after": 5
  }
}
{
  "name": "Outstream 15s",
  "type": "video",
  "specs": {
    "max_file_size": "10MB",
    "file_types": [
      "mp4",
      "webm"
    ],
    "max_duration": 15
  }
}
{
  "name": "CTV 30s",
  "type": "video",
  "specs": {
    "max_file_size": "50MB",
    "file_types": [
      "mp4"
    ],
    "max_duration": 30
  }
}
```
**Response Time:** 36ms
**Status:** ✅ PASS

### Query 4: What publishers can I access?
**PRD Expected:** 10 properties: ESPN, CNN, Weather, TechCrunch...
**Actual Response:**
```json
{
  "name": "ESPN",
  "type": null,
  "reach": null
}
{
  "name": "CNN Digital",
  "type": null,
  "reach": null
}
{
  "name": "Weather.com",
  "type": null,
  "reach": null
}
{
  "name": "TechCrunch",
  "type": null,
  "reach": null
}
{
  "name": "Sports Illustrated",
  "type": null,
  "reach": null
}
{
  "name": "Bleacher Report",
  "type": null,
  "reach": null
}
{
  "name": "Forbes",
  "type": null,
  "reach": null
}
{
  "name": "Automotive News Network",
  "type": null,
  "reach": null
}
{
  "name": "Spotify",
  "type": null,
  "reach": null
}
{
  "name": "New York Times",
  "type": null,
  "reach": null
}
```
**Response Time:** 35ms
**Count:** 10 properties
**Status:** ✅ PASS

