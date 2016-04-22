#!/bin/sh
iw dev wlan0 del
iw phy phy0 interface add mon0 type monitor
