from __future__ import annotations

import json
import math
import shutil
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pmtiles import convert

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "public" / "maps" / "norway.pmtiles"
TILE_SIZE = 256
MAX_ZOOM = 3

SEA_COLOR = "#d7e5ee"
GRID_COLOR = "#f3f7fa"
LAND_COLOR = "#e6edde"
LAND_OUTLINE = "#c6d1be"
NORWAY_FILL = "#d3e0cf"
NORWAY_OUTLINE = "#4a6d4c"
CITY_FILL = "#a04e36"
CITY_OUTLINE = "#ffffff"
LABEL_COLOR = "#2f4030"

SCANDINAVIA_CONTEXT = [
    (3.0, 55.0),
    (9.0, 55.2),
    (13.0, 55.4),
    (18.5, 56.5),
    (24.0, 58.0),
    (28.0, 61.5),
    (31.5, 66.0),
    (32.0, 69.5),
    (30.0, 71.0),
    (25.0, 71.5),
    (18.0, 70.5),
    (12.0, 68.5),
    (7.0, 64.0),
    (4.0, 60.0),
    (3.0, 55.0),
]

NORWAY_OUTLINE_POINTS = [
    (4.5, 57.9),
    (5.1, 58.4),
    (5.5, 59.2),
    (5.0, 60.3),
    (5.4, 61.1),
    (6.0, 62.0),
    (6.8, 63.0),
    (8.4, 64.0),
    (9.6, 64.7),
    (11.0, 65.3),
    (12.6, 66.1),
    (14.1, 67.0),
    (15.8, 68.0),
    (17.6, 69.0),
    (20.0, 70.0),
    (22.6, 70.9),
    (25.6, 71.1),
    (29.2, 70.7),
    (31.0, 70.3),
    (30.6, 69.5),
    (28.8, 68.8),
    (26.4, 67.8),
    (24.6, 66.7),
    (23.0, 65.0),
    (20.6, 63.6),
    (17.8, 62.5),
    (15.2, 61.5),
    (12.8, 60.7),
    (10.1, 59.8),
    (7.6, 58.9),
    (6.0, 58.1),
    (4.5, 57.9),
]

CITY_POINTS = [
    ("Oslo", 10.7522, 59.9139),
    ("Bergen", 5.3221, 60.39299),
    ("Trondheim", 10.3951, 63.4305),
    ("Tromso", 18.9553, 69.6492),
]


def clamp_lat(lat: float) -> float:
    return max(min(lat, 85.05112878), -85.05112878)


def lon_lat_to_global_pixels(lon: float, lat: float, zoom: int) -> tuple[float, float]:
    scale = TILE_SIZE * (2**zoom)
    x = (lon + 180.0) / 360.0 * scale
    lat_rad = math.radians(clamp_lat(lat))
    mercator = math.log(math.tan((math.pi / 4.0) + (lat_rad / 2.0)))
    y = (1.0 - mercator / math.pi) / 2.0 * scale
    return x, y


def to_tile_pixels(lon: float, lat: float, zoom: int, tile_x: int, tile_y: int) -> tuple[float, float]:
    global_x, global_y = lon_lat_to_global_pixels(lon, lat, zoom)
    return global_x - (tile_x * TILE_SIZE), global_y - (tile_y * TILE_SIZE)


def draw_graticule(draw: ImageDraw.ImageDraw, zoom: int, tile_x: int, tile_y: int) -> None:
    lat_step = 10 if zoom <= 1 else 5
    lon_step = 30 if zoom <= 1 else 15
    for lon in range(-180, 181, lon_step):
        points = [to_tile_pixels(float(lon), float(lat), zoom, tile_x, tile_y) for lat in range(-80, 81, 4)]
        draw.line(points, fill=GRID_COLOR, width=1)
    for lat in range(-80, 81, lat_step):
        points = [to_tile_pixels(float(lon), float(lat), zoom, tile_x, tile_y) for lon in range(-180, 181, 6)]
        draw.line(points, fill=GRID_COLOR, width=1)


def draw_polygon(draw: ImageDraw.ImageDraw, coordinates: list[tuple[float, float]], zoom: int, tile_x: int, tile_y: int, fill: str, outline: str, width: int) -> None:
    pixels = [to_tile_pixels(lon, lat, zoom, tile_x, tile_y) for lon, lat in coordinates]
    draw.polygon(pixels, fill=fill, outline=outline, width=width)


def draw_city(draw: ImageDraw.ImageDraw, font: ImageFont.ImageFont, name: str, lon: float, lat: float, zoom: int, tile_x: int, tile_y: int) -> None:
    x, y = to_tile_pixels(lon, lat, zoom, tile_x, tile_y)
    if x < -24 or y < -24 or x > TILE_SIZE + 24 or y > TILE_SIZE + 24:
      return

    radius = 4 if zoom >= 2 else 3
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=CITY_FILL, outline=CITY_OUTLINE, width=2 if zoom >= 2 else 1)
    label_offset_x = 8
    label_offset_y = -8 if zoom >= 2 else 6
    draw.text((x + label_offset_x, y + label_offset_y), name, fill=LABEL_COLOR, font=font)


def draw_map_label(draw: ImageDraw.ImageDraw, font: ImageFont.ImageFont, text: str, x: int, y: int) -> None:
    bbox = draw.textbbox((x, y), text, font=font)
    padding_x = 6
    padding_y = 3
    draw.rounded_rectangle(
        (
            bbox[0] - padding_x,
            bbox[1] - padding_y,
            bbox[2] + padding_x,
            bbox[3] + padding_y,
        ),
        radius=8,
        fill="#f4f7f0",
        outline="#d5dec8",
        width=1,
    )
    draw.text((x, y), text, fill=LABEL_COLOR, font=font)


def render_tile(zoom: int, tile_x: int, tile_y: int, font: ImageFont.ImageFont) -> Image.Image:
    image = Image.new("RGB", (TILE_SIZE, TILE_SIZE), SEA_COLOR)
    draw = ImageDraw.Draw(image)

    draw_graticule(draw, zoom, tile_x, tile_y)
    draw_polygon(draw, SCANDINAVIA_CONTEXT, zoom, tile_x, tile_y, LAND_COLOR, LAND_OUTLINE, 2)
    draw_polygon(draw, NORWAY_OUTLINE_POINTS, zoom, tile_x, tile_y, NORWAY_FILL, NORWAY_OUTLINE, 3 if zoom >= 2 else 2)

    for name, lon, lat in CITY_POINTS:
        draw_city(draw, font, name, lon, lat, zoom, tile_x, tile_y)

    if zoom == 0 and tile_x == 0 and tile_y == 0:
        draw_map_label(draw, font, "Norway offline basemap", 72, 22)
    elif zoom == 1 and tile_x == 1 and tile_y == 0:
        draw_map_label(draw, font, "Norway", 124, 82)

    return image


def build_tiles(output_root: Path) -> None:
    font = ImageFont.load_default()
    for zoom in range(MAX_ZOOM + 1):
        tiles_per_axis = 2**zoom
        for tile_x in range(tiles_per_axis):
            for tile_y in range(tiles_per_axis):
                tile_dir = output_root / str(zoom) / str(tile_x)
                tile_dir.mkdir(parents=True, exist_ok=True)
                image = render_tile(zoom, tile_x, tile_y, font)
                image.save(tile_dir / f"{tile_y}.png", optimize=True)

    metadata = {
        "name": "Beredskap101 Bundled Norway Basemap",
        "description": "Bundled local raster PMTiles basemap for shelter-map fallback.",
        "type": "baselayer",
        "version": "1.0.0",
        "format": "png",
        "minzoom": 0,
        "maxzoom": MAX_ZOOM,
        "bounds": "-180.0,-85.05112878,180.0,85.05112878",
        "center": "10.0,64.0,5",
        "attribution": "Beredskap101 bundled offline basemap",
    }
    (output_root / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="beredskap101-pmtiles-") as temp_dir:
        temp_root = Path(temp_dir)
        build_tiles(temp_root)
        convert.disk_to_pmtiles(str(temp_root), str(OUTPUT_PATH), maxzoom=MAX_ZOOM, tile_format="png", verbose=False)

    size = OUTPUT_PATH.stat().st_size
    print(f"Wrote {OUTPUT_PATH} ({size} bytes)")


if __name__ == "__main__":
    main()
