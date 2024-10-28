'use client'
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import microphone from '/public/mic.png';
import bin from '/public/bin3.png';
import stopRec from '/public/stop_rec1.png';
import './globals.css';

const Audio: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleStartRecording = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder: MediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunks.current = [];
      };
    } catch (err) {
      console.error('Error accessing microphone: ', err);
    }
  };

  const handleStopRecording = (): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = (): void => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleDeleteRecording = (): void => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioURL('');
    audioChunks.current = [];
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setTimer(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getRandomDelay = (): string => `${Math.random() * 2}s`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      {isRecording && (
        <div className="recordingIndicator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: "10px", color: "rgb(88, 87, 87)" }} className="timerDisplay">
            {formatTime(timer)}
          </div>
          <div className="spikes" style={{ display: 'flex', justifyContent: 'center' }}>
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="spike"
                style={{ animationDelay: getRandomDelay() }}
              ></div>
            ))}
          </div>
        </div>
      )}
      {audioURL && (
        <div style={{ paddingTop: "10px", paddingBottom: "10px" }} className="deleteIcon" onClick={handleDeleteRecording}>
          <span className="binWrapper">
            <Image src={bin} alt="Delete Audio" className="binIcon" height={30} />
          </span>
        </div>
      )}
      {!isRecording && audioURL && (
        <div className="audioPreview" style={{ paddingBottom: "10px" }}>
          <audio className="audioRec" controls controlsList="nodownload" src={audioURL} />
        </div>
      )}
      <div
        className='micButton'
        onClick={handleToggleRecording}
        style={{
          backgroundColor: isRecording ? '#c6c7c6' : '#57b04e',
          width: '50px',
          textAlign: 'center',
          marginTop: '10px',
        }}
      >
        <Image
          className='sendAudio'
          src={isRecording ? stopRec : microphone}
          alt={isRecording ? 'Cancel Recording' : 'Mic'}
          height={30}
          style={{
            filter: isRecording ? 'none' : 'invert(1) brightness(2)', 
          }}
        />
      </div>
    </div>
  );
  
};

export default Audio;
