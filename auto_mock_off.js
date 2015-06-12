/*
Module imports are hoisted, which is why you can’t turn off
auto-mocking beforehand.
Work-around: make this module the first import.
*/

jest.autoMockOff();
