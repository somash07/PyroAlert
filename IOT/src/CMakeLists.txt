idf_component_register(
  SRCS "main.cpp"
  INCLUDE_DIRS "."
  EMBED_TXTFILES "${CMAKE_SOURCE_DIR}/server_cert.pem"
)
