import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { calculateHref, type CalculateHrefOptions } from "./calculateHref.js";
import { init } from "../init.js";
import { location } from "./Location.js";
import { ROUTING_UNIVERSES, ALL_HASHES } from "../../testing/test-utils.js";

describe("calculateHref", () => {
    describe("(...paths) Overload", () => {
        let cleanup: Function;
        beforeAll(() => {
            cleanup = init();
        });
        afterAll(() => {
            cleanup();
        });
        test.each([
            {
                inputPaths: ["path", "anotherPath"],
                expectedHref: "path/anotherPath",
            },
            {
                inputPaths: ["path?a=b", "anotherPath?c=d"],
                expectedHref: "path/anotherPath?a=b&c=d",
            },
            {
                inputPaths: ["path#hash", "anotherPath#hash2"],
                expectedHref: "path/anotherPath#hash",
            }
        ])("Should combine paths $inputPaths as $expectedHref", ({ inputPaths, expectedHref }) => {
            // Act
            const href = calculateHref(...inputPaths);

            // Assert
            expect(href).toBe(expectedHref);
        });
    });

    // Test across all routing universes for comprehensive coverage
    ROUTING_UNIVERSES.forEach((universe) => {
        describe(`(options, ...paths) Overload - ${universe.text}`, () => {
            let cleanup: Function;
            
            beforeAll(() => {
                cleanup = init({ 
                    defaultHash: universe.defaultHash,
                    hashMode: universe.hashMode
                });
            });
            
            afterAll(() => {
                cleanup();
            });
            
            const basePath = "/base/path";
            const baseHash = universe.hashMode === 'multi' 
                ? "#p1=path/one;p2=path/two" 
                : "#base/hash";
            
            beforeEach(() => {
                location.url.href = `https://example.com${basePath}${baseHash}`;
            });
            
            describe("Basic navigation", () => {
                test.each([
                    {
                        opts: { hash: universe.hash, preserveHash: false },
                        url: '/sample/path',
                        expectedHref: (() => {
                            if (universe.hash === ALL_HASHES.path) return '/sample/path';
                            if (universe.hash === ALL_HASHES.single) return '#/sample/path';
                            if (universe.hash === ALL_HASHES.implicit) {
                                return universe.defaultHash === false ? '/sample/path' : '#/sample/path';
                            }
                            // Multi-hash routing - preserves existing paths and adds/updates the specified hash
                            if (typeof universe.hash === 'string') {
                                // This will preserve existing paths and update/add the new one
                                return `#${universe.hash}=/sample/path;p2=path/two`;
                            }
                            return '/sample/path';
                        })(),
                        text: "create correct href without preserving hash",
                    },
                    {
                        opts: { hash: universe.hash, preserveHash: true },
                        url: '/sample/path',
                        expectedHref: (() => {
                            if (universe.hash === ALL_HASHES.path) return `/sample/path${baseHash}`;
                            if (universe.hash === ALL_HASHES.single) return '#/sample/path';
                            if (universe.hash === ALL_HASHES.implicit) {
                                return universe.defaultHash === false ? `/sample/path${baseHash}` : '#/sample/path';
                            }
                            // Multi-hash routing - preserveHash doesn't apply to hash routing
                            if (typeof universe.hash === 'string') {
                                return `#${universe.hash}=/sample/path;p2=path/two`;
                            }
                            return `/sample/path${baseHash}`;
                        })(),
                        text: "handle hash preservation correctly",
                    },
                ])("Should $text in ${universe.text}", ({ opts, url, expectedHref }) => {
                    // Act
                    const href = calculateHref(opts, url);

                    // Assert
                    expect(href).toBe(expectedHref);
                });
            });

            describe("Query string preservation", () => {
                test.each([
                    { preserveQuery: true, text: 'preserve' },
                    { preserveQuery: false, text: 'not preserve' },
                ])("Should $text the query string in ${universe.text}", ({ preserveQuery }) => {
                    // Arrange
                    const newPath = "/sample/path";
                    const query = "a=b&c=d";
                    location.url.search = `?${query}`;
                    
                    const expectedHref = (() => {
                        const baseHref = (() => {
                            if (universe.hash === ALL_HASHES.path) return newPath;
                            if (universe.hash === ALL_HASHES.single) return `#${newPath}`;
                            if (universe.hash === ALL_HASHES.implicit) {
                                return universe.defaultHash === false ? newPath : `#${newPath}`;
                            }
                            // Multi-hash routing
                            if (typeof universe.hash === 'string') {
                                return `#${universe.hash}=${newPath};p2=path/two`;
                            }
                            return newPath;
                        })();
                        
                        if (!preserveQuery) return baseHref;
                        
                        // Add query string
                        if (baseHref.startsWith('#')) {
                            return `?${query}${baseHref}`;
                        } else {
                            return `${baseHref}?${query}`;
                        }
                    })();

                    // Act
                    const href = calculateHref({ hash: universe.hash, preserveQuery }, newPath);

                    // Assert
                    expect(href).toBe(expectedHref);
                });
            });

            if (universe.hashMode === 'multi') {
                describe("Multi-hash routing behavior", () => {
                    test("Should preserve all existing paths when adding a new path", () => {
                        // Arrange
                        const newPath = "/sample/path";
                        const newHashId = 'new';

                        // Act
                        const href = calculateHref({ hash: newHashId }, newPath);

                        // Assert
                        expect(href).toBe(`${baseHash};${newHashId}=${newPath}`);
                    });

                    test("Should preserve all existing paths when updating an existing path", () => {
                        // Arrange
                        const newPath = "/sample/path";
                        const existingHashId = 'p1';
                        const expected = baseHash.replace(/(p1=).+;/i, `$1${newPath};`);

                        // Act
                        const href = calculateHref({ hash: existingHashId }, newPath);

                        // Assert
                        expect(href).toEqual(expected);
                    });
                });
            }

            if (universe.hash === ALL_HASHES.implicit) {
                describe("Implicit hash resolution", () => {
                    test("Should resolve implicit hash according to defaultHash", () => {
                        // Arrange
                        const newPath = "/sample/path";
                        const expectedHref = universe.defaultHash === false ? newPath : `#${newPath}`;

                        // Act
                        const href = calculateHref({ hash: universe.hash }, newPath);

                        // Assert
                        expect(href).toBe(expectedHref);
                    });
                });
            }
        });
    });

    describe("HREF Validation", () => {
        let cleanup: Function;
        
        beforeAll(() => {
            cleanup = init();
        });
        
        afterAll(() => {
            cleanup();
        });

        test("Should reject HREF with http protocol", () => {
            expect(() => calculateHref("http://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "http://example.com/path"');
        });

        test("Should reject HREF with https protocol", () => {
            expect(() => calculateHref("https://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "https://example.com/path"');
        });

        test("Should reject HREF with ftp protocol", () => {
            expect(() => calculateHref("ftp://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "ftp://example.com/path"');
        });

        test("Should reject HREF with protocol-relative URL", () => {
            expect(() => calculateHref("//example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "//example.com/path"');
        });

        test("Should reject HREF with custom protocol", () => {
            expect(() => calculateHref("custom-protocol://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "custom-protocol://example.com/path"');
        });

        test("Should reject HREF when passed in options overload", () => {
            expect(() => calculateHref({}, "https://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "https://example.com/path"');
        });

        test("Should reject HREF among multiple valid paths", () => {
            expect(() => calculateHref("/valid/path", "https://example.com/invalid", "/another/valid"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "https://example.com/invalid"');
        });

        test("Should allow valid relative paths", () => {
            expect(() => calculateHref("/path", "relative/path", "../other/path")).not.toThrow();
        });

        test("Should allow valid paths with query and hash", () => {
            expect(() => calculateHref("/path?query=value", "relative/path#hash")).not.toThrow();
        });

        test("Should allow paths that start with protocol-like strings but are not URLs", () => {
            expect(() => calculateHref("/http-endpoint", "/https-folder")).not.toThrow();
        });
    });
});
