export const colorArr = ['#d81e06', '#f4ea2a', '#1afa29', '#1296db', '#13227a', '#d4237a', '#ffffff', '#e6e6e6', '#dbdbdb', '#cdcdcd', '#bfbfbf', '#8a8a8a', '#707070', '#515151', '#2c2c2c'];

export const InconSize = [
    { value: 16, label: 16 },
    { value: 32, label: 32 },
    { value: 48, label: 48 },
    { value: 64, label: 64 },
    { value: 128, label: 128 },
    { value: 256, label: 256 },
];

export function replaceFirstElement(arr, newElement) {
    arr.unshift(newElement);
    arr.pop();
    return arr;
}