SHELL := /bin/bash

#
# Define NPM and check if it is available on the system.
#
NPM := $(shell command -v npm 2> /dev/null)
ifndef NPM
    $(error npm is not available on your system, please install npm)
endif
app_name=$(notdir $(CURDIR))
project_directory=$(CURDIR)/../$(app_name)
build_tools_directory=$(CURDIR)/build/tools
appstore_package_name=$(CURDIR)/build/dist/$(app_name)

occ=$(CURDIR)/../../occ
private_key=$(HOME)/.owncloud/certificates/$(app_name).key
certificate=$(HOME)/.owncloud/certificates/$(app_name).crt
sign=php -f $(occ) integrity:sign-app --privateKey="$(private_key)" --certificate="$(certificate)"
sign_skip_msg="Skipping signing, either no key and certificate found in $(private_key) and $(certificate) or occ can not be found at $(occ)"
ifneq (,$(wildcard $(private_key)))
ifneq (,$(wildcard $(certificate)))
ifneq (,$(wildcard $(occ)))
	CAN_SIGN=true
endif
endif
endif

PHPUNIT="$(PWD)/lib/composer/phpunit/phpunit/phpunit"

drawio_doc_files=COPYING.txt screenshot.png
drawio_src_dirs=appinfo img css js lib templates
drawio_all_src=$(drawio_src_dirs) $(drawio_doc_files)
build_dir=build
dist_dir=$(build_dir)/dist

.PHONY: clean
clean: clean-dist clean-build

#
# dist
#

$(dist_dir)/drawio:
	rm -Rf $@; mkdir -p $@
	cp -R $(drawio_all_src) $@

.PHONY: dist
dist: clean $(dist_dir)/drawio
ifdef CAN_SIGN
	$(sign) --path="$(appstore_package_name)"
else
	@echo $(sign_skip_msg)
endif
	COPYFILE_DISABLE=1 tar --exclude='._*' -czf $(appstore_package_name).tar.gz -C $(appstore_package_name)/../ $(app_name)

.PHONY: clean-dist
clean-dist:
	rm -Rf $(dist_dir)

.PHONY: clean-build
clean-build:
	rm -Rf $(build_dir)