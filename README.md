
# Instructions

## Generate Offline Map

Download the `mobac` tool, select your map for offline usage and
export the atlas. The exported atlas will be a `Layer.osz` file
that you need to extract into the `map/<name>` folder, so that
the `map/<name>/Manifest.txt` file exists at this location.

Create the `map/<name>/meta.json` file with the following structure,
while replacing it with the correct values.

Set the `center` of the map to the geolocation center of the city
you already exported into the OSM Map before.

Set the `zoom` to the minimum and maximum value of the zoom levels
that are also contained in the map's `Manifest.txt` file.

```json
{
	"center": [
		50.0001,
		13.3337
	],
	"zoom": [
		13,
		16
	]
}
```

## Import Wigle Wifi Data

On your smartphone, open up the `Wigle` app and go to `Database` and
press the `CSV EXPORT DB` button. This might take a while (up to a
couple minutes).

Transfer the file to your computer and move it to the `map/WigleWifi*.csv`
file.


## 3. Run ./configure.sh

The configure script will now import the Offline Map and the Wigle log,
and generate the ready-to-use application.


# TODO

- ./bin/configure.js script should move / copy recursively the map folders
  to the ./public/map/* paths after wifi.json was generated.
