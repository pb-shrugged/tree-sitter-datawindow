cmake_minimum_required(VERSION 3.13)

project(tree-sitter-datawindow
        VERSION "0.0.3"
        DESCRIPTION "Datawindow syntax grammar for Tree-sitter"
        HOMEPAGE_URL "https://github.com/pb-shrugged/tree-sitter-datawindow"
        LANGUAGES C)

option(BUILD_SHARED_LIBS "Build using shared libraries" ON)
option(TREE_SITTER_REUSE_ALLOCATOR "Reuse the library allocator" OFF)

set(TREE_SITTER_ABI_VERSION 15 CACHE STRING "Tree-sitter ABI version")
if(NOT ${TREE_SITTER_ABI_VERSION} MATCHES "^[0-9]+$")
    unset(TREE_SITTER_ABI_VERSION CACHE)
    message(FATAL_ERROR "TREE_SITTER_ABI_VERSION must be an integer")
endif()

include(GNUInstallDirs)

find_program(TREE_SITTER_CLI tree-sitter DOC "Tree-sitter CLI")

add_library(tree-sitter-datawindow
            grammars/datawindow_syntax/src/parser.c
            grammars/datawindow_expression/src/parser.c)

if(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/grammars/datawindow_syntax/src/scanner.c)
  target_sources(tree-sitter-datawindow PRIVATE grammars/datawindow_syntax/src/scanner.c)
endif()

if(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/grammars/datawindow_expression/src/scanner.c)
  target_sources(tree-sitter-datawindow PRIVATE grammars/datawindow_expression/src/scanner.c)
endif()

target_include_directories(tree-sitter-datawindow
                           PRIVATE 
                           grammars/datawindow_syntax/src
                           grammars/datawindow_expression/src
                           INTERFACE $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/bindings/c>
                                     $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>)

target_compile_definitions(tree-sitter-datawindow PRIVATE
                           $<$<BOOL:${TREE_SITTER_REUSE_ALLOCATOR}>:TREE_SITTER_REUSE_ALLOCATOR>
                           $<$<CONFIG:Debug>:TREE_SITTER_DEBUG>)

set_target_properties(tree-sitter-datawindow
                      PROPERTIES
                      C_STANDARD 11
                      POSITION_INDEPENDENT_CODE ON
                      SOVERSION "${TREE_SITTER_ABI_VERSION}.${PROJECT_VERSION_MAJOR}"
                      DEFINE_SYMBOL "")

configure_file(bindings/c/tree-sitter-datawindow.pc.in
               "${CMAKE_CURRENT_BINARY_DIR}/tree-sitter-datawindow.pc" @ONLY)

install(DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bindings/c/tree_sitter"
        DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}"
        FILES_MATCHING PATTERN "*.h")
install(FILES "${CMAKE_CURRENT_BINARY_DIR}/tree-sitter-datawindow.pc"
        DESTINATION "${CMAKE_INSTALL_LIBDIR}/pkgconfig")
install(TARGETS tree-sitter-datawindow
        LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}")

file(GLOB QUERIES queries/*.scm)
install(FILES ${QUERIES}
        DESTINATION "${CMAKE_INSTALL_DATADIR}/tree-sitter/queries/datawindow")

add_custom_target(ts-test "${TREE_SITTER_CLI}" test
                  WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
                  COMMENT "tree-sitter test")
