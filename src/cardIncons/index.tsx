import { Button, ColorPicker, ColorPickerProps, GetProp, Modal, Select, message } from 'antd';
import './index.scss';
import React, { ElementType, ReactNode, useRef, useState } from 'react';
import { InconSize, colorArr, replaceFirstElement } from './utils';
import { toPng, toJpeg } from 'html-to-image';

interface CardInconITem {
    title: string,
    children: ReactNode,
    incon: ElementType
}

type Color = GetProp<ColorPickerProps, 'value'>;

export default function CardIncons(props: CardInconITem) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [colorSelectArr, setColorSelectArr] = useState(colorArr.slice(0, 8));
    const [inconColor, setInconColor] = useState<Color>('#000000');
    const [inconSize, setInconSize] = useState<number>(128);
    // Ref for the icon container
    const iconRef = useRef<HTMLDivElement>(null);
    const downloadSvg = () => {
        if (iconRef.current) {
            // Extract the SVG node from the icon component
            const svgElement = iconRef.current.querySelector('svg');
            if (svgElement) {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${props.title}.svg`;
                link.click();
            } else {
                console.error('No SVG element found in the icon.');
            }
        }
    };

    // Function to download PNG
    const downloadPng = () => {
        if (iconRef.current) {
            const svgElement: any = iconRef.current.querySelector('svg');
            toPng(svgElement)
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `${props.title}.png`;
                    link.click();
                })
                .catch((err) => console.error("PNG download failed: ", err));
        }
    };

    const downloadJpeg = () => {
        if (iconRef.current) {
            const svgElement: any = iconRef.current.querySelector('svg');
            toJpeg(svgElement)
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `${props.title}.jpeg`;
                    link.click();
                })
                .catch((err) => console.error("PNG download failed: ", err));
        }
    };
    // Function to copy SVG code
    const copySvgCode = () => {
        if (iconRef.current) {
            const svgElement = iconRef.current.querySelector('svg');
            if (svgElement) {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                navigator.clipboard.writeText(svgData)
                    .then(() => message.success('复制成功'))
                    .catch((err) => console.error("Copy SVG code failed: ", err));
            } else {
                console.error('No SVG element found to copy.');
            }
        }
    };

    const copyCode = () =>{
        navigator.clipboard.writeText(`<${props.title } />`)
        .then(() => message.success('复制成功'))
        .catch((err) => console.error("Copy SVG code failed: ", err));
    }

    return (
        <>
            <div className='card-incons' onClick={() => setIsOpen(true)}>
                {props.children}
            </div>
            {isOpen && (
                <Modal
                    width={600}
                    title={props?.title}
                    open={isOpen}
                    onOk={() => setIsOpen(false)}
                    onCancel={() => setIsOpen(false)}
                    footer={<div className='modal-foot'>
                        <Button type="primary" onClick={downloadSvg}>SVG下载</Button>
                        <Button type="primary" onClick={downloadPng}>PNG下载</Button>
                        <Button type="primary" onClick={downloadJpeg}>JPEG下载</Button>
                        <Button type="primary" onClick={copySvgCode}>复制SVG代码</Button>
                        <Button type="primary" onClick={copyCode}>复制组件</Button>
                    </div>}
                >
                    <div className='modal-conent'>
                        <div className='incon-info' ref={iconRef}>
                            <div className={`incon ${inconColor === '#ffffff' ? 'tbackground' : ''}`}>
                                {React.createElement(props.incon, { style: { fontSize: inconSize, color: inconColor } })}
                            </div>
                            <div className='color-select oneColor'>
                                <div className='fist-color'>
                                    {colorArr.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setInconColor(item);
                                                if (colorSelectArr[0] !== item) {
                                                    setColorSelectArr(replaceFirstElement(colorSelectArr, item));
                                                }
                                            }}
                                            className='color-card'
                                            style={{ backgroundColor: item }}
                                        />
                                    ))}
                                </div>
                                <div className='color-select select-info'>
                                    <div className='fist-color'>
                                        {colorSelectArr.map((item, index) => (
                                            <div
                                                key={item + index + '123'}
                                                className='color-card'
                                                onClick={() => setInconColor(item)}
                                                style={{ backgroundColor: item }}
                                            />
                                        ))}
                                    </div>
                                    <div className='color-size'>
                                        <ColorPicker
                                            value={inconColor}
                                            showText
                                            format='hex'
                                            onChange={(value: any) => {
                                                setInconColor(`#${value.toHex()}`);
                                                if (colorSelectArr[0] !== value) {
                                                    setColorSelectArr(replaceFirstElement(colorSelectArr, `#${value.toHex()}`));
                                                }
                                            }}
                                            allowClear
                                        />
                                        <Select
                                            defaultValue={inconSize}
                                            style={{ width: 70, marginLeft: '10px' }}
                                            onChange={(value: number) => setInconSize(value)}
                                            options={InconSize}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
