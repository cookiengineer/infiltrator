
# Instructions

## 1. Generate Offline Map

Install the `mobac` (Mobile Atlas Creator) on your system and
follow the [MOBAC Guide](./guide/MOBAC.md). After you've done
that, continue here.


## 2. Integrate Offline Map

Create the `map/<name>/meta.json` file with the following structure,
while replacing it with the correct values. Note that the `name` in
in the JSON file has to be identical as the named folder.

Set the `center` of the map to the geolocation center of the city
you already exported into the OSM Map before. You can search that
via Google by entering "geolocation <City>".

Set the `zoom` to the minimum and maximum value of the zoom levels
that are also contained in the map's `Manifest.txt` file and that
you previously selected while generating the Offline Map.

```json
{
	"name": "<name>",
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


## 3. Import Wigle Wifi Data

On your smartphone, open up the `Wigle` app and go to `Database` and
press the `CSV EXPORT DB` button. This might take a while depending
on how many Wi-Fis you've logged already.

Transfer the file to your computer and move it to the `./map` folder,
so that it is located at `./map/WigleWifi*.csv`.


## 4. Run ./bin/configure.js

The configure script will now import the Offline Map and the Wigle log,
and generate the ready-to-use application. This might also take a while,
as it has to process every single log entry line-by-line (and recorrect
previous log entries thereof).

Afterwards there should be a `wifi.json` file existing in every `./map/<name>`
folder containing a large JSON with the recorrected point of interests.


## 5. Start the App

Now you can just startup a web server to serve the `/path/to/infiltrator`
root folder and you can visit the web app. Note that it must load a shitload
of images, so try testing it locally first.

```bash
cd /path/to/infiltrator;

python -m http.server 1337;
```

Et voila, now you can select some maps and regions and you can see which
Wi-Fis you've owned.

![10-infiltrator-app](./guide/10-infiltrator-app.jpg)


# TODO

- Calculate bounding boxes correctly depending on the `Manifest.txt` file.
  Currently, I have no effing clue how the math behind OSZ format looks like,
  as the wiki article gives totally inaccurate information on that.

