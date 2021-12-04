#!/bin/sh

### Проверяем наличе входящих SDI

# finished=true

# while ${finished}
# do
# s=`ps xa | grep ffmpeg | awk '{print $1}'`
# if [ "$s" = "" ];
#     then
#         finished=false
#     else
#         echo Транскодирется, не могу убить!
#         exit
#     fi
# done

### Убиваем рабочий процесс исходящего потока на первый SDI

finished1=true

while ${finished1}
do
k=`ps xa | grep ffmpeg | grep genpts | awk '{print $1}'`
if [ "$k" = "" ];
    then
         finished1=false
    else
         kill -9 "$k"
         echo Убил!
    fi
done

### Запускаесмя


# in=2
# m=10
# while [ $((i=n++)) -le $m ]

while true
do
o=`ps xa | grep ffmpeg | grep genpts |awk '{print $1}'`
if [ "$o" = "" ];
    then
        /usr/bin/nohup /bin/ffmpeg -stream_loop -1 -fflags +genpts -i /home/node/web/playlist/$1 -f decklink -pix_fmt uyvy422 -ar 48000 -s 1920x1080 -r 25000/1000 'DeckLink SDI' \
         -vf drawtext="fontfile=/usr/share/fonts/gnu-free/FreeSerif.ttf:fontsize=72: box=1: boxcolor=black@0.75: boxborderw=5: fontcolor=white:x=(w-text_w)/10: y=((h-text_h)/10): text='%{localtime\:%H\\\\\:%M\\\\\:%S}'" -c:v libx264 -crf 21 -preset veryfast -c:a aac -b:a 128k -ac 2 -hls_time 5 -hls_list_size 12 -hls_flags delete_segments -f hls /var/www/html/playlist.m3u8 >/dev/null 2>&1 &
        echo Запускаюсь!
    else
        echo Работает!
        echo PID "$o"
        exit
    fi
done
