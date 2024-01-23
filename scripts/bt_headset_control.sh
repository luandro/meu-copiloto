#!/bin/bash

read_sink_profile=$(pacmd list-sinks | grep -B 1 "name:.*bluez_sink" | grep -oP "(?<=<).*(?=>)")
IFS='.' read -ra ADDR <<< "$read_sink_profile"
current_sink="${ADDR[0]/sink/card}.${ADDR[1]}"
current_profile="${ADDR[-1]}"
echo $current_sink
echo $current_profile
if [ "$current_profile" = "a2dp_sink" ]; then
    playerctl pause
    pacmd set-card-profile "$current_sink" handsfree_head_unit
    echo "Switched to handsfree_head_unit profile."

elif [ "$current_profile" = "handsfree_head_unit" ]; then
    pacmd set-card-profile "$current_sink" a2dp_sink
    playerctl play
    echo "Switched to a2dp_sink profile."
else
    echo "Current profile is not handsfree_head_unit or a2dp_sink."
fi
